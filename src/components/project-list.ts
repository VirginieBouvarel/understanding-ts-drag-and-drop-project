import AutoBind from "../decorators/autobind.js";
import { DragTarget } from "../models/drag-and-drop.js";
import { Project, ProjectStatus } from "../models/project.js";
import { projectState } from "../state/project-state.js";
import Component from "./base-components.js";
import ProjectItem from "./project-item.js";

// ProjectList Class
export default class ProjectList extends Component <HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

constructor(private type: ProjectStatus) {
  super('project-list', 'app', false, `${type}-projects`);
  this.assignedProjects = [];

  this.configure();
  this.renderContent();
}

@AutoBind
dragOverHandler(event: DragEvent): void {
  if (!(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain')) {
    return;
  }
  event.preventDefault();
  const listElement = this.element.querySelector('ul')!;
  listElement.classList.add('droppable');
}
@AutoBind
dropHandler(event: DragEvent): void {
  const projectId = event.dataTransfer!.getData('text/plain');
  projectState.moveProject(projectId, this.type);
}
@AutoBind
dragLeaveHandler(_event: DragEvent): void {
  const listElement = this.element.querySelector('ul')!;
  listElement.classList.remove('droppable');
}

configure() {
  this.element.addEventListener('dragover', this.dragOverHandler);
  this.element.addEventListener('drop', this.dropHandler);
  this.element.addEventListener('dragleave', this.dragLeaveHandler);
  projectState.addListener(this.projectsListHandler);
}

renderContent() {
  const listId = `${this.type}-projects-list`;
  this.element.querySelector('ul')!.id = listId;
  this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
}

@AutoBind
private projectsListHandler(projects: Project[]) {
  const relevantProjects = projects.filter(project => project.status === this.type);
  this.assignedProjects = relevantProjects;
  this.renderProjects();
}

private renderProjects() {
  const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
  listElement.innerHTML = '';
  for (const project of this.assignedProjects) {
    new ProjectItem(listElement.id, project);
  }
}
}