
import Reflux from 'reflux';


// TODO(dcramer): we should probably just make every parameter update
// work on bulk groups
let GroupActions = Reflux.createActions([
  'assignTo',
  'assignToError',
  'assignToSuccess',
  'delete',
  'deleteError',
  'deleteSuccess',
  'update',
  'updateError',
  'updateSuccess',
  'merge',
  'mergeError',
  'mergeSuccess',
  'updateRedmineId',
  'updateRedmineIdSuccess',
  'updateRedmineIdError',
]);


export default GroupActions;

