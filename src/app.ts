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

// Gestion de l'état de l'application
type Listener = (items: Project[]) => void;

class ProjectState {
  private static instance: ProjectState;
  private projects: Project[] = []; // Données dont l'état est géré
  private listeners: Listener[] = []; // Liste de fonctions qui seront jouées lors d'un changement d'état

  private constructor() {}

  static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listernerFunction: Listener) { // On donne la possibilité à l'extérieur d'ajouter des fonctions à jouer lors du changement d'état
    this.listeners.push(listernerFunction);
  }
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(), 
      title, 
      description, 
      numOfPeople, 
      ProjectStatus.Active
    );

    this.projects.push(newProject); // L'état change

    // On appelle les fonctions qui doivent être jouées lors d'un changement d'état
    // On leur passe en paramètre le nouvel état
    for (const listernerFunction of this.listeners) {
      listernerFunction(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation des champs de formulaire
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

// Décorateur Autobind
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

// liste de projets
class ProjectList {
    // DOM elements
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;

    assignedProjects: Project[];

  constructor(private type: ProjectStatus) {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    // On demande à la classe projectState d'ajouter une nouvelle signature de fonction dans sa liste d'écouteurs à jouer lors d'un changement d'état
		// Cette fonction recevra en paramètres une liste de projet (aka le nouvel état)
		// Comme elle est autobindée this se réfèrera à sa classe parente de définition
		// Elle aura donc accès à assignedProjects et à renderProject()
    // On pourrait aussi utiliser une fonction anonyme fléchée ici
    // Car leur this est bindé automatiquement
    projectState.addListener(this.projectsListHandler);

    this.attach();
    this.renderContent();

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
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listElement.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

// Formulaire
class ProjectInput {
  // DOM elements
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  // Form fields
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // On récupère les éléments du DOM à manipuler
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // Dans le template project-input on récupère le noeud du formulaire 
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    // On gère le style si besoin -> #user-input dans app.css
    this.element.id = 'user-input';

    // On récupère chaque élément du formulaire pour pouvoir l'utiliser le moment venu
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    // On configure un écouteur d'évènement sur le submit du formulaire
    this.configure();

    // On attache le noeud du formulaire dans la div app après son contenu existant
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    // On récupère les saisies
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

    // On les valide (sommairement pour le moment)
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      // Si un des valeur est invalide on ne retourne rien et on déclenche une alerte
      alert('Invalid input, please try again!');
      return;
    } else {
      // Si tout est ok on retourne le tuple attendu
      return [enteredTitle, enteredDescription, +enteredPeople];
    }

  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
  // On force le binding du this sur la classe appelante
  @AutoBind 
  private submitHandler(event: Event) {
    event.preventDefault();

    // On vérifie les saisies utilisateur 
    const userInput = this.gatherUserInput();

    // Si tout est ok on demande à la classe projectState d'ajouter le projet crée dans sa liste de projets, puis on vide le formulaire
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people); // On appelle projectState pour lui demander une modification d'état
      this.clearInputs();
    }
  }
  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList(ProjectStatus.Active);
const finishedPrjList = new ProjectList(ProjectStatus.Finished);

