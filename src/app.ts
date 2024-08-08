// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project Type
enum ProjectStatus { 
  Active = "active", 
  Finished = "finished"
}

class Project {
  constructor(
    public id: string, 
    public title: string, 
    public description: string, 
    public people: number, 
    public status: ProjectStatus,
  ) {}
}

// Project State Management
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = []; 

  addListener(listernerFunction: Listener<T>) { 
    this.listeners.push(listernerFunction);
  }
}

class ProjectState extends State<Project> {
  private static instance: ProjectState;
  private projects: Project[] = [];

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(), 
      title, 
      description, 
      numOfPeople, 
      ProjectStatus.Active
    );

    this.projects.push(newProject); 
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listernerFunction of this.listeners) {
      listernerFunction(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// AutoBind decorator
function AutoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalDescriptor = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalDescriptor.bind(this);
    }
  };
  return newDescriptor;
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
      templateId: string, 
      hostElementId: string, 
      insertAtStart: boolean,
      newElementId?: string,
    ) {
      this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
      this.hostElement = document.getElementById(hostElementId)! as T;

      const importedNode = document.importNode(this.templateElement.content, true);
      this.element = importedNode.firstElementChild as U;
      if (newElementId) this.element.id = newElementId;

      this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
      this.hostElement.insertAdjacentElement(
        insertAtBeginning ? 'afterbegin' : 'beforeend', 
        this.element
      );
    }
    abstract configure(): void;
    abstract renderContent(): void;
}

// ProjectItem Class
class ProjectItem extends Component <HTMLUListElement, HTMLLIElement> implements Draggable {
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

// ProjectList Class
class ProjectList extends Component <HTMLDivElement, HTMLElement> implements DragTarget {
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

// ProjectInput Class
class ProjectInput extends Component <HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = { 
      value: enteredTitle, 
      required: true 
    };
    const descriptionValidatable: Validatable = { 
      value: enteredDescription, 
      required: true, 
      minLength: 5 
    };
    const peopleValidatable: Validatable = { 
      value: +enteredPeople, 
      required: true, 
      min: 1, 
      max: 5 
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }

  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @AutoBind 
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people); 
      this.clearInputs();
    }
  }
}

// Programme
new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);

