//import jquery from 'jquery';

abstract class LoadController {
  public static init() {
    $('#close-load-btn').on('click', () => {
      LoadController.close();
    });
    $('#load-custom-btn').on('click', () => {
      $('#upload-json').trigger('click');
    });
    $('#community-creations-btn').on('click', () => {
      LoadController.open();
    });

    let panel = LoadController;
    $('.load-panel').on('click', '.list-item', async function () {
      let list_name = $(this).closest('.list-container').attr('id');
      let value = $(this).find('.hidden-value').text();
      if (list_name === 'worlds-list-container') {
        const base = `./assets/worlds/`;
        let resp = await fetch(base + value + '.json');
        let json = await resp.json();
        panel.control_panel.loadEnv(json);
        panel.close();
      } else if (list_name === 'organisms-list-container') {
        const base = `./assets/organisms/`;
        let resp = await fetch(base + value + '.json');
        let json = await resp.json();
        panel.control_panel.editor_controller.loadOrg(json);
        panel.close();
        $('#maximize').click();
        $('#editor').click();
      } else if (list_name === 'mods-list-container') {
        window.open(value, '_blank');
      }
    });

    $('#load-env-btn').click(async () => {});
    $('#load-org-btn').click(async () => {});

    LoadController.loadList('worlds');
    LoadController.loadList('organisms');
    LoadController.loadList('mods');
  }

  public static async loadList(name: string) {
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
      let html = `<li class="list-item">
                        ${item.name}`;
      if (item.subname) html += `<br>(${item.subname})`;
      html += `<div class="hidden-value" hidden>${item.value}</div>
                    </li>`;
      $(id).append(html);
    }
  }

  public static async open() {
    $('.load-panel').css('display', 'block');
  }

  // @todo: any
  public static loadJson(callback: any) {
    $('#upload-json').on('change', e => {
      let files = e.target.files;
      if (!files.length) {
        return;
      }
      let reader = new FileReader();
      reader.onload = e => {
        try {
          if (e.target !== null && typeof e.target.result === 'string') {
            let json = JSON.parse(e.target.result);
            callback(json);
          }
          LoadController.close();
        } catch (e) {
          console.error(e);
          alert('Failed to load');
        }
        $('#upload-json')[0].value = '';
      };
      reader.readAsText(files[0]);
    });
    $('#upload-json').trigger('click');
  }

  public static close() {
    $('.load-panel').css('display', 'none');
    $('#load-selected-btn').off('click');
    $('#upload-json').off('change');
  }
};

/*jquery(() => {
  LoadController.init();
});*/

export default LoadController;
