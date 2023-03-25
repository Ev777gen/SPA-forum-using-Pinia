import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPencil, faAngleDown, faRightFromBracket, faRightToBracket, faCamera } from '@fortawesome/free-solid-svg-icons';

library.add(faPencil, faAngleDown, faRightFromBracket, faRightToBracket, faCamera);

export default (app) => {
  app.component('font-awesome-icon', FontAwesomeIcon);
}