#coding=utf-8
from __future__ import absolute_import

from django.conf import settings
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.db import transaction
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.cache import never_cache

from sentry import features
from sentry.models import AuthProvider, Organization
from sentry.web.forms.accounts import AuthenticationForm, RegistrationForm
from sentry.web.frontend.base import BaseView
from sentry.utils import auth

ERR_NO_SSO = _('The organization does not exist or does not have Single Sign-On enabled.')


class AuthLoginView(BaseView):
    auth_required = False

    def get_auth_provider(self, organization_slug):
        try:
            organization = Organization.objects.get(
                slug=organization_slug
            )
        except Organization.DoesNotExist:
            return None

        try:
            auth_provider = AuthProvider.objects.get(
                organization=organization
            )
        except AuthProvider.DoesNotExist:
            return None

        return auth_provider

    def get_login_form(self, request):
        op = request.POST.get('op')
        return AuthenticationForm(
            request, request.POST if op == 'login' else None,
            captcha=bool(request.session.get('needs_captcha')),
        )

    def get_register_form(self, request):
        op = request.POST.get('op')
        return RegistrationForm(
            request.POST if op == 'register' else None,
            captcha=bool(request.session.get('needs_captcha')),
        )

    def handle_basic_auth(self, request):
        can_register = features.has('auth:register') or request.session.get('can_register')

        op = request.POST.get('op')

        # Detect that we are on the register page by url /register/ and
        # then activate the register tab by default.
        if not op and '/register' in request.path_info and can_register:
            op = 'register'

        login_form = self.get_login_form(request)
        if can_register:
            register_form = self.get_register_form(request)
        else:
            register_form = None

        if can_register and register_form.is_valid():
            user = register_form.save()

            # HACK: grab whatever the first backend is and assume it works
            user.backend = settings.AUTHENTICATION_BACKENDS[0]

            auth.login(request, user)

            # can_register should only allow a single registration
            request.session.pop('can_register', None)

            request.session.pop('needs_captcha', None)

            return self.redirect(auth.get_login_redirect(request))

        elif login_form.is_valid():
            auth.login(request, login_form.get_user())

            request.session.pop('needs_captcha', None)

            return self.redirect(auth.get_login_redirect(request))

        elif request.POST and not request.session.get('needs_captcha'):
            auth.log_auth_failure(request, request.POST.get('username'))
            request.session['needs_captcha'] = 1
            login_form = self.get_login_form(request)
            login_form.errors.pop('captcha', None)
            if can_register:
                register_form = self.get_register_form(request)
                register_form.errors.pop('captcha', None)

        request.session.set_test_cookie()

        context = {
            'op': op or 'login',
            'login_form': login_form,
            'register_form': register_form,
            'CAN_REGISTER': can_register,
        }
        
        return self.respond('sentry/login.html', context)

    def handle_sso(self, request):
        org = request.POST.get('organization')
        if not org:
            return HttpResponseRedirect(request.path)

        auth_provider = self.get_auth_provider(request.POST['organization'])
        if auth_provider:
            next_uri = reverse('sentry-auth-organization',
                               args=[request.POST['organization']])
        else:
            next_uri = request.path
            messages.add_message(request, messages.ERROR, ERR_NO_SSO)

        return HttpResponseRedirect(next_uri)

    @never_cache
    @transaction.atomic
    def handle(self, request):
        # Single org mode -- send them to the org-specific handler
        if settings.SENTRY_SINGLE_ORGANIZATION:
            org = Organization.get_default()
            next_uri = reverse('sentry-auth-organization',
                               args=[org.slug])
            return HttpResponseRedirect(next_uri)

        op = request.POST.get('op')
        if op == 'sso' and request.POST.get('organization'):
            auth_provider = self.get_auth_provider(request.POST['organization'])
            if auth_provider:
                next_uri = reverse('sentry-auth-organization',
                                   args=[request.POST['organization']])
            else:
                next_uri = request.path
                messages.add_message(request, messages.ERROR, ERR_NO_SSO)

            return HttpResponseRedirect(next_uri)
        return self.handle_basic_auth(request)


########################################
#openid login
########################################
import urllib
import urllib2
import cookielib
import base64
from sentry.models import User
import hmac
import hashlib

def redirect_url(root_url, next_url):
    # Step 1
    # 1. 第一步进行关联（associate）操作
    # 2. openid.session_type为DH-SHA1, DH-SHA256, no-encryption
    # 3. 使用DH主要是为了在不安全通道中交换密钥，由于我们的服务是走https的，
    # 4. 所以这里使用了no-encryption
    # 5. 即发起关联只需要以HTTP POST的方式向OpenID Server提交如下固定数据
    associate_data = {
        'openid.mode' : 'associate',
        'openid.assoc_type' : 'HMAC-SHA256', # OpenID消息签名算法，or HAMC-SHA1
        'openid.session_type' : 'no-encryption',
    }
    
    associate_data = urllib.urlencode(associate_data)
    assoc_dict = {}
    #直接发起关联请求，主要是因为对于网易来说，我们只有https://login.netease.com/openid/这个服务
    #并且，我们已经明确知道他的URL是https://login.netease.com/openid/，再进行Discovery多此一举
    # assoc_resp = urllib2.urlopen('https://login.netease.com/openid/', associate_data)
    cookie = cookielib.CookieJar()
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookie))
    assoc_resp = opener.open('https://login.netease.com/openid/', associate_data)
    # OpenID Server会以行为单位，分别换回如下内容：
    # assoc_handle:{HMAC-SHA256}{5279ff11}{w6nbEA==}
    # expires_in:86400
    # mac_key:g5PWpAb+pbwuTTGDt+95tWKRxN5RAhxDjpqHGwZ2OWw=
    # assoc_type:HMAC-SHA256
    # 这些值需要存储在session或者其它地方，当用户跳转回后，需要使用这些数据校验签名
    for line in assoc_resp.readlines():
        line = line.strip()
        if not line:
            continue
        k, v = line.split(":")
        assoc_dict[k] = v
    
    # Step 2
    # 构造重定向URL，发起请求认证
    # 已经associate完成，构造checkid_setup的内容（请求认证）
    redirect_data = {
        'openid.ns' : 'http://specs.openid.net/auth/2.0', # 固定字符串
        'openid.mode' : 'checkid_setup', # 固定字符串
        'openid.assoc_handle' : assoc_dict['assoc_handle'], # 第一步获取的assoc_handle值
        # 如果想偷懒，可以不做associate操作，直接将openid_assoc_handle设置为空
        # 这种情况下，OpenID Server会自动为你生成一个新的assoc_handle，你需要通过check_authentication进行数据校验
        #'openid.assoc_handle' : None,
        'openid.return_to' : root_url + 'auth/openid-callback/?' + urllib.urlencode({'next': next_url}), # 当用户在OpenID Server登录成功后，你希望它跳转回来的地址
        'openid.claimed_id' : 'http://specs.openid.net/auth/2.0/identifier_select', # 固定字符串
        'openid.identity' : 'http://specs.openid.net/auth/2.0/identifier_select', # 固定字符串
        'openid.realm' : root_url, # 声明你的身份（站点URL），通常这个URL要能覆盖openid.return_to
        'openid.ns.sreg' : 'http://openid.net/extensions/sreg/1.1', # 固定字符串
        # fullname为中文，如果您的环境有中文编码困扰，可以不要
        'openid.sreg.required' : "nickname,email,fullname", # 三个可以全部要求获取，或者只要求一个
    }
    redirect_data = urllib.urlencode(redirect_data)

    #实际应用中，需要交由浏览器进行Redirect的URL，用户在这里完成交互认证
    return "https://login.netease.com/openid/?" + redirect_data, assoc_dict['mac_key']

#openid登陆成功后返回到/openid_login_callback，请到url中映射
def openid_login_callback(request):
    #构造需要检查签名的内容
    OPENID_RESPONSE = dict(request.GET)
    SIGNED_CONTENT = []
    #import json
    #print json.dumps(OPENID_RESPONSE, indent=4)
    for k in OPENID_RESPONSE['openid.signed'][0].split(","):
        response_data = OPENID_RESPONSE["openid.%s" % k]
        SIGNED_CONTENT.append("%s:%s\n" % ( k, response_data[0] ))
    SIGNED_CONTENT = "".join(SIGNED_CONTENT).encode("UTF-8")
    # 使用associate请求获得的mac_key与SIGNED_CONTENT进行assoc_type hash，
    # 检查是否与OpenID Server返回的一致
    SIGNED_CONTENT_SIG = base64.b64encode(
            hmac.new( base64.b64decode(request.session.get('mac_key', '')),
            SIGNED_CONTENT, hashlib.sha256 ).digest())
    
    if SIGNED_CONTENT_SIG != OPENID_RESPONSE['openid.sig'][0]:
        return render_template('error.html', message='认证失败，请重新登录验证')
    
    request.session.pop('mac_key', None) 
    email = request.GET.get('openid.sreg.email', '')
    fullname = request.GET.get('openid.sreg.fullname', '')
    next_url = request.GET.get('next', '/')

    login_user = User.objects.filter(username__iexact=email)
    if login_user.exists():
        login_user = login_user[0]
        login_user.password="sentry_netease_openid_pwd"
    else:
        #不存在数据，则增加数据数用户表
        login_user = User(username=email, name=fullname, email=email, password="sentry_netease_openid_pwd")
        login_user.save() #save to db
    # HACK: grab whatever the first backend is and assume it works
    login_user.backend = settings.AUTHENTICATION_BACKENDS[0]

    auth.login(request, login_user)
    # can_register should only allow a single registration
    request.session.pop('can_register', None)
    request.session.pop('needs_captcha', None)
    return HttpResponseRedirect(next_url)


def openid_login_index(request):
    # TODO add openid, 在这个地方跳转到openid的位置 by hzwangzhiwei @20160113
    location, mac_key = redirect_url('http://' + request.get_host() + '/', auth.get_login_redirect(request))
    request.session['mac_key'] = mac_key
    return HttpResponseRedirect(location) #跳转到openid登陆

def openid_org_login_index(request, organization_slug):
    openid_login_index(request)
########################################