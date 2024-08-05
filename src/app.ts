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

// Classe principale
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

    // Si tout est ok on traite les données puis on vide le formulaire
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
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


