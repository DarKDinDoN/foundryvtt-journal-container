import { CONSTANTS } from "../shared/constants.js";

export class JournalContainer extends Application {
  #apps = new Map();
  #active;
  #dom_tabs;
  #dom_containers;

  constructor() {
    super({
      id: CONSTANTS.APP_ID,
      template: `${CONSTANTS.PATH}templates/container.hbs`,
      title: CONSTANTS.APP_TITLE,
      classes: [],
      popOut: true,
      resizable: true,
      width: 960,
      height: 880
    });

    this.#registerHooks();
  }

  #registerHooks() {
    Hooks.on("renderJournalSheet", (app, html) => {
      this.#attachJournalToContainer(app, html);
    });
  }

  async #attachJournalToContainer(app, html) {
    if (!this.rendered) await this._render(true);
    if (!this.#dom_tabs && !this.#dom_containers) return;

    const _html = html[0];
    if (!_html.classList.contains("journal-sheet")) return;

    this.#apps.set(app.id, app);
    this.#active = app.id;

    this.#buildNav();
    this.#addContainer(app, _html);
    this.#activateContainer(app.id);
  }

  #buildNav() {
    let html = "";
    for (let app of this.#apps.values()) {
      html += `
        <div class="tab ${app.id === this.#active ? "active" : ""}" data-id="${app.id}">
          ${app.document.name}
          <i class=" close fa-regular fa-circle-xmark"></i>
        </div>
      `;
    }

    this.#dom_tabs.innerHTML = html;

    const tabs = this.#dom_tabs.querySelectorAll(".tab");
    for (let tab of tabs) {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.#switchTab(tab.dataset.id);
      });
    }

    const closeButtons = this.#dom_tabs.querySelectorAll(".close");
    for (let button of closeButtons) {
      button.addEventListener("click", () => {
        event.preventDefault();
        event.stopPropagation();
        this.#closeTab(button.closest("div.tab").dataset.id);
      });
    }
  }

  #switchTab(id) {
    if (this.#apps.size === 1) return;

    this.#active = id;
    this.#buildNav();
    this.#activateContainer(this.#active);
  }

  #closeTab(id) {
    if (this.#apps.size === 1) return this.close();

    this.#apps.get(id).close();
    this.#apps.delete(id);

    this.#deleteContainer(id);

    if (this.#active === id) {
      this.#active = [...this.#apps.keys()][0];
    }

    this.#buildNav();
    this.#activateContainer(this.#active);
  }

  #addContainer(app, html) {
    const div = document.createElement("div");
    div.setAttribute("id", app.id);
    div.classList.add("journal-entry-container");
    div.replaceChildren(html);

    this.#dom_containers.appendChild(div);
  }

  #deleteContainer(id) {
    const container = this.#dom_containers.querySelector(`.journal-entry-container#${id}`);
    this.#dom_containers.removeChild(container);
  }

  #activateContainer(id) {
    const oldContainer = this.#dom_containers.querySelector(".journal-entry-container.active");
    if (oldContainer) oldContainer.classList.remove("active");

    const newContainer = this.#dom_containers.querySelector(`.journal-entry-container#${id}`);
    newContainer.classList.add("active");
  }

  async _render(force = false, options = {}) {
    await super._render(force, options);

    const _element = this.element[0];

    if (!_element) return;

    this.#dom_tabs = _element.querySelector(".tabs");
    this.#dom_containers = _element.querySelector(".containers");
  }

  async close(options = {}) {
    await super.close(options);

    for (let app of this.#apps.values()) {
      app.close();
    }

    this.#apps.clear();
    this.#active = undefined;
    this.#dom_tabs.innerHTML = "";
    this.#dom_containers.innerHTML = "";
  }
}
