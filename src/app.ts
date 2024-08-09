import _ from 'lodash';
console.log(_.shuffle([1,2,3]));

import ProjectInput from "./components/project-input";
import ProjectList from "./components/project-list";
import { ProjectStatus } from "./models/project";

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);

