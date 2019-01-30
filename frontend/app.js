import angular from 'angular';
import angularRoute from 'angular-route';
__webpack_public_path__ = "http://localhost:" + SERVER_PORT + "/";

import './styles/index';
import 'lodash';
import 'popper.js';
import 'tooltip.js';
import 'angular-bootstrap-contextmenu/contextMenu';
import 'jquery.flipster';
import 'moment';
import 'typeface-roboto';
import 'angular-sanitize';  
import 'bootstrap/js/dist/carousel';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/popover';
import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/util';

import './API/alloy.db';
import './API/cast.framework'; 
import './API/cast.v1';
import './API/angular-auto-complete';
import './API/coverflow/index';
import Directives from './directives';
import Components from './components';
import Services from './services';
import Factories from './factories';
import ApplicationConfig from './config.js';
import ApplicationRun from './run.js';
$('[data-toggle="popover"]').popover();

angular.module('alloy', [angularRoute, 'ngSanitize', 'autoCompleteModule', 'ui.bootstrap.contextMenu', Directives.name, Components.name, Factories.name, Services.name])
  .config(ApplicationConfig)
  .run(ApplicationRun);