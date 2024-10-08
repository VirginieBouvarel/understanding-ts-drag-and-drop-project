import AutoBind from "../decorators/autobind";
import { Draggable } from "../models/drag-and-drop";
import { Project } from "../models/project";
import Component from "./base-components";

// ProjectItem Class
export default class ProjectItem extends Component <HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get participantsText() {
    return `${this.project.people.toString()} Participant${this.project.people > 1 ? 's' : ''}`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id); 
    event.dataTransfer!.effectAllowed = "move"; 
  }
  @AutoBind
  dragEndHandler(_event: DragEvent): void {
      console.log('DragEnd');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.participantsText;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}