import jquery, { Event } from 'jquery';
import ControlPanel from "./ControlPanel";

class LoadController {
  control_panel: ControlPanel | null;

  constructor(control_panel: ControlPanel | null = null) {
    this.control_panel = (control_panel !== null)
      ? control_panel
      : null;
  }

  init() {
    if (this.control_panel === null) {
      return;
    }
    jquery(() => {    
      $('#close-load-btn').on('click', () => {
        this.close();
      });
      $('#load-custom-btn').on('click', () => {
        $('#upload-json').trigger('click');
      });
      $('#community-creations-btn').on('click', () => {
        this.open();
      });

      let self = this;
      $('.load-panel').on('click', '.list-item', async function () {
        if (self.control_panel === null) {
          return;
        }        
        let list_name = $(this).closest('.list-container').attr('id');
        let value = $(this).find('.hidden-value').text();
        if (list_name === 'worlds-list-container') {
          const base = `./assets/worlds/`;
          let resp = await fetch(base + value + '.json');
          let json = await resp.json();
          self.control_panel.loadEnv(json);
          self.close();
        } else if (list_name === 'organisms-list-container') {
          const base = `./assets/organisms/`;
          let resp = await fetch(base + value + '.json');
          let json = await resp.json();
          self.control_panel.editor_env_controller.loadOrg(json);
          self.close();
          $('#maximize').click();
          $('#editor').click();
        } else if (list_name === 'mods-list-container') {
          window.open(value, '_blank');
        }
      });

      $('#load-env-btn').click(async () => {});
      $('#load-org-btn').click(async () => {});

      this.loadList('worlds');
      this.loadList('organisms');
      this.loadList('mods');      
    });      
  }

  async loadList(name: string) {
    const base = `./assets/${name}/`;

    let list = [];
    try {
      let resp = await fetch(base + '_list.json');
      list = await resp.json();
    } catch (e) {
      console.error('Failed to load list: ', e);
    }

    let id = `#${name}-list`;
    $(id).empty();
    for (let item of list) {
      let html = `<li class="list-item">${item.name}`;
      if (item.subname) {
        html += `<br>(${item.subname})`;
      }
      html += `<div class="hidden-value" hidden>${item.value}</div></li>`;
      $(id).append(html);
    }
  }

  async open() {
    $('.load-panel').css('display', 'block');
  }
  
  // @todo: any
  loadJson(callback: any) {
    $('#upload-json').on('change', (event: JQuery.ChangeEvent) => {
      let files: FileList | null = (event.target as HTMLInputElement).files;
      if (files === null || !files.length) {
        return;
      }
      let reader = new FileReader();
      reader.onload = (ev: ProgressEvent) => {
        try {
          if (ev.target !== null) {
            let result = (<FileReader>ev.target).result;
            if (typeof result === 'string') {
              let json = JSON.parse(result);
              callback(json);
            } else {
              alert('Failed to load');              
            }
          }
          this.close();
        } catch (err) {
          console.error(err);
          alert('Failed to load');
        }
        let els = $('#upload-json');
        if (els.length > 0) {
          let input = els[0];
          (input as HTMLInputElement).value = '';
        }
      };
      reader.readAsText(files[0]);
    });
    $('#upload-json').trigger('click');
  }

  close() {
    $('.load-panel').css('display', 'none');
    $('#load-selected-btn').off('click');
    $('#upload-json').off('change');
  }
}

export default LoadController;
