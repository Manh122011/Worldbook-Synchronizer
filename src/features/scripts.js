import { generateUUID } from '../utils.js';
import { extractContentFromMessage } from './sync.js';
import { isDefaultCollapse } from './settings.js';

export let extractedFrontendCards = [];
export let extractedScriptCards = [];

let $crImportGlobalBtn;
let $crImportPresetBtn;
let $crImportCharacterBtn;
let $crDownloadBtn;
let $crLoadBtn;
let $crFileInput;

let $mainImportRegexBtn;
let $mainImportRegexOptions;
let $mainImportRegexGlobalBtn;
let $mainImportRegexPresetBtn;
let $mainImportRegexCharacterBtn;
let $mainRegexFileInput;

let $ssExtractBtn;
let $ssCardsContainer;

let $feExtractBtn;
let $feCardsContainer;

let $csImportGlobalScriptBtn;
let $csImportPresetScriptBtn;
let $csImportCharacterScriptBtn;
let $csDownloadBtn;
let $csLoadBtn;
let $csFileInput;

let $mainImportScriptBtn;
let $mainImportScriptOptions;
let $mainImportScriptGlobalBtn;
let $mainImportScriptPresetBtn;
let $mainImportScriptCharacterBtn;
let $mainScriptFileInput;

let currentRegexImportTarget = '';
let currentScriptImportTarget = '';

export function initScripts() {
  $crImportGlobalBtn = $('#wb-sync-cr-import-global-btn');
  $crImportPresetBtn = $('#wb-sync-cr-import-preset-btn');
  $crImportCharacterBtn = $('#wb-sync-cr-import-character-btn');
  $crDownloadBtn = $('#wb-sync-cr-download-btn');
  $crLoadBtn = $('#wb-sync-cr-load-btn');
  $crFileInput = $('#wb-sync-cr-file-input');

  $mainImportRegexBtn = $('#wb-sync-main-import-regex-btn');
  $mainImportRegexOptions = $('#wb-sync-main-import-regex-options');
  $mainImportRegexGlobalBtn = $('#wb-sync-main-import-regex-global-btn');
  $mainImportRegexPresetBtn = $('#wb-sync-main-import-regex-preset-btn');
  $mainImportRegexCharacterBtn = $('#wb-sync-main-import-regex-character-btn');
  $mainRegexFileInput = $('#wb-sync-main-regex-file-input');

  $ssExtractBtn = $('#wb-sync-ss-extract-btn');
  $ssCardsContainer = $('#wb-sync-ss-cards-container');

  $feExtractBtn = $('#wb-sync-fe-extract-btn');
  $feCardsContainer = $('#wb-sync-fe-cards-container');

  $csImportGlobalScriptBtn = $('#wb-sync-cs-import-global-script-btn');
  $csImportPresetScriptBtn = $('#wb-sync-cs-import-preset-script-btn');
  $csImportCharacterScriptBtn = $('#wb-sync-cs-import-character-script-btn');
  $csDownloadBtn = $('#wb-sync-cs-download-btn');
  $csLoadBtn = $('#wb-sync-cs-load-btn');
  $csFileInput = $('#wb-sync-cs-file-input');

  $mainImportScriptBtn = $('#wb-sync-main-import-script-btn');
  $mainImportScriptOptions = $('#wb-sync-main-import-script-options');
  $mainImportScriptGlobalBtn = $('#wb-sync-main-import-script-global-btn');
  $mainImportScriptPresetBtn = $('#wb-sync-main-import-script-preset-btn');
  $mainImportScriptCharacterBtn = $('#wb-sync-main-import-script-character-btn');
  $mainScriptFileInput = $('#wb-sync-main-script-file-input');

  $crImportGlobalBtn.on('click', () => handleRegexImport('cr', 'global'));
  $crImportPresetBtn.on('click', () => handleRegexImport('cr', 'preset'));
  $crImportCharacterBtn.on('click', () => handleRegexImport('cr', 'character'));
  $crDownloadBtn.on('click', () => handleRegexDownload('cr'));
  $crLoadBtn.on('click', () => $crFileInput.click());
  $crFileInput.on('change', e => handleRegexFileLoad(e, 'cr'));

  $mainImportRegexBtn.on('click', () => {
    const isCharacterSelected = SillyTavern.getContext().characterId !== undefined;
    if (isCharacterSelected) {
      $mainImportRegexCharacterBtn.show();
    } else {
      $mainImportRegexCharacterBtn.hide();
    }
    $mainImportRegexOptions.slideToggle();
  });

  $mainImportRegexGlobalBtn.on('click', () => {
    currentRegexImportTarget = 'global';
    $mainRegexFileInput.click();
  });
  $mainImportRegexPresetBtn.on('click', () => {
    currentRegexImportTarget = 'preset';
    $mainRegexFileInput.click();
  });
  $mainImportRegexCharacterBtn.on('click', () => {
    currentRegexImportTarget = 'character';
    $mainRegexFileInput.click();
  });

  $mainRegexFileInput.on('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!window.TavernHelper) throw new Error('TavernHelper không tải');

        const tavernRegex = data.id ? data : convertToTavernRegex(data);

        let targetOpt = { type: 'global' };
        if (currentRegexImportTarget === 'preset') targetOpt = { type: 'preset', name: 'in_use' };
        if (currentRegexImportTarget === 'character') targetOpt = { type: 'character', name: 'current' };

        đang chờ window.TavernHelper.updateTavernRegexesWith(regexes => {
          biểu thức chính quy.push (TavernRegex);
          trả về biểu thức chính quy;
        }, targetOpt);
        toastr.success(
          `Đã nhập thành công vào ${currentRegexImportTarget === 'global'? 'toàn cầu': currentRegexImportTarget === 'đặt trước'? 'Preset' : 'local'} tập lệnh thông thường!`,
        );
        $mainImportRegexOptions.slideUp();
      } catch (err) {
        toastr.error('Nhập không thành công: ' + err.message);
      }
      $mainRegexFileInput.val('');
    };
    reader.readAsText(file);
  });

  $ssExtractBtn.on('click', () => handleExtractScript('ss'));
  $ssCardsContainer.on('click', '.ss-import-global-btn', function () {
    handleScriptImport('ss', 'global', $(this).data('id'));
  });
  $ssCardsContainer.on('click', '.ss-import-preset-btn', function () {
    handleScriptImport('ss', 'preset', $(this).data('id'));
  });
  $ssCardsContainer.on('click', '.ss-import-character-btn', function () {
    handleScriptImport('ss', 'character', $(this).data('id'));
  });
  $ssCardsContainer.on('click', '.ss-download-btn', function () {
    handleScriptDownload('ss', $(this).data('id'));
  });
  $ssCardsContainer.on('click', '.ss-delete-btn', function () {
    removeScriptCard($(this).data('id'));
  });
  $ssCardsContainer.on('click', '.wb-sync-card-header', function () {
    const $content = $(this).siblings('.wb-sync-card-content');
    const $icon = $(this).find('.wb-sync-collapse-icon');
    if ($content.is(':visible')) {
      $content.slideUp(200);
      $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    } else {
      $content.slideDown(200);
      $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
    }
  });

  $feExtractBtn.on('click', handleExtractFrontend);
  $feCardsContainer.on('click', '.fe-import-global-btn', function () {
    handleRegexImport('fe', 'global', $(this).data('id'));
  });
  $feCardsContainer.on('click', '.fe-import-preset-btn', function () {
    handleRegexImport('fe', 'preset', $(this).data('id'));
  });
  $feCardsContainer.on('click', '.fe-import-character-btn', function () {
    handleRegexImport('fe', 'character', $(this).data('id'));
  });
  $feCardsContainer.on('click', '.fe-download-btn', function () {
    handleRegexDownload('fe', $(this).data('id'));
  });
  $feCardsContainer.on('click', '.fe-render-btn', function () {
    handleFrontendRender($(this).data('id'));
  });
  $feCardsContainer.on('click', '.fe-delete-btn', function () {
    removeFrontendCard($(this).data('id'));
  });
  $feCardsContainer.on('click', '.wb-sync-card-header', function () {
    const $content = $(this).siblings('.wb-sync-card-content');
    const $icon = $(this).find('.wb-sync-collapse-icon');
    if ($content.is(':visible')) {
      $content.slideUp(200);
      $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    } else {
      $content.slideDown(200);
      $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
    }
  });

  $csImportGlobalScriptBtn.on('click', () => handleScriptImport('cs', 'global'));
  $csImportPresetScriptBtn.on('click', () => handleScriptImport('cs', 'preset'));
  $csImportCharacterScriptBtn.on('click', () => handleScriptImport('cs', 'character'));
  $csDownloadBtn.on('click', () => handleScriptDownload('cs'));
  $csLoadBtn.on('click', () => $csFileInput.click());
  $csFileInput.on('change', e => handleScriptFileLoad(e, 'cs'));

  $mainImportScriptBtn.on('click', () => {
    const isCharacterSelected = SillyTavern.getContext().characterId !== undefined;
    if (isCharacterSelected) {
      $mainImportScriptCharacterBtn.show();
    } else {
      $mainImportScriptCharacterBtn.hide();
    }
    $mainImportScriptOptions.slideToggle();
  });

  $mainImportScriptGlobalBtn.on('click', () => {
    currentScriptImportTarget = 'global';
    $mainScriptFileInput.click();
  });
  $mainImportScriptPresetBtn.on('click', () => {
    currentScriptImportTarget = 'preset';
    $mainScriptFileInput.click();
  });
  $mainImportScriptCharacterBtn.on('click', () => {
    currentScriptImportTarget = 'character';
    $mainScriptFileInput.click();
  });

  $mainScriptFileInput.on('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!window.TavernHelper) throw new Error('TavernHelper không tải');

        const scriptObj =
          data.type === 'script'
            ? data
            : {
                type: 'script',
                enabled: data.enabled !== false,
                name: data.name || 'Tập lệnh đã nhập',
                id:
                  data.id ||
                  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    let r = (Math.random() * 16) | 0,
                      v = c == 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                  }),
                content: data.content || '',
                info: data.info || 'Được nhập bởi World Book Synchronizer',
                button: data.button || { enabled: false, buttons: [] },
                data: data.data || {},
              };

        let targetOpt = { type: 'global' };
        if (currentScriptImportTarget === 'preset') targetOpt = { type: 'preset' };
        if (currentScriptImportTarget === 'character') targetOpt = { type: 'character' };

        đang chờ window.TavernHelper.updateScriptTreesWith(scripts => {
          scripts.push(scriptObj);
          trả lại tập lệnh;
        }, targetOpt);
        toastr.success(
          `Đã nhập thành công vào ${currentScriptImportTarget === 'global' ? 'toàn cầu': currentScriptImportTarget === 'đặt trước'? Thư viện tập lệnh 'Preset' : 'role'}!`,
        );
        $mainImportScriptOptions.slideUp();
      } catch (err) {
        toastr.error('Nhập không thành công: ' + err.message);
      }
      $mainScriptFileInput.val('');
    };
    reader.readAsText(file);
  });
}

export function getRegexObjFromUI(prefix, cardId = null) {
  const suffix = cardId ? `-${cardId}` : '';
  const htmlContent = $(`#wb-sync-${prefix}-content${suffix}`).val();
  if (!htmlContent) return null;

  const scriptName = $(`#wb-sync-${prefix}-script-name${suffix}`).val().trim() || 'Kịch bản giao diện người dùng mới';
  const findRegex = $(`#wb-sync-${prefix}-find-regex${suffix}`).val() || '<Mở bảng>';

  const vị tríInts = [];
  $(`.wb-sync-${prefix}-placement-cb${suffix}:checked`).each(function () {
    placementInts.push(parseInt($(this).val()));
  });
  if (placementInts.length === 0) placementInts.push(2);

  const isDisabled = $(`#wb-sync-${prefix}-disabled${suffix}`).is(':checked');
  const runOnEdit = $(`#wb-sync-${prefix}-run-on-edit${suffix}`).is(':checked');
  const substituteRegex = parseInt($(`#wb-sync-${prefix}-substitute-regex${suffix}`).val()) || 0;

  const markdownOnly = $(`#wb-sync-${prefix}-markdown-only${suffix}`).is(':checked');
  const promptOnly = $(`#wb-sync-${prefix}-prompt-only${suffix}`).is(':checked');

  const minDepthStr = $(`#wb-sync-${prefix}-min-depth${suffix}`).val();
  const minDepth = minDepthStr !== '' ? parseInt(minDepthStr) : null;

  const maxDepthStr = $(`#wb-sync-${prefix}-max-depth${suffix}`).val();
  const maxDepth = maxDepthStr !== '' ? parseInt(maxDepthStr) : null;

  const trimStringsRaw = $(`#wb-sync-${prefix}-trim-strings${suffix}`).val() || '';
  const trimStrings = trimStringsRaw
    .split('\n')
    .map(s => s.trim())
    .filter(s => s !== '');

  const regexObj = {
    id: generateUUID(),
    scriptName: scriptName,
    findRegex: findRegex,
    replaceString: htmlContent,
    trimStrings: trimStrings,
    placement: placementInts,
    disabled: isDisabled,
    markdownOnly: markdownOnly,
    promptOnly: promptOnly,
    runOnEdit: runOnEdit,
    substituteRegex: substituteRegex,
    minDepth: minDepth,
    maxDepth: maxDepth,
  };

  if (!regexObj.replaceString.startsWith('```')) {
    regexObj.replaceString = '```html\n' + regexObj.replaceString + '\n```';
  }
  return regexObj;
}

export function convertToTavernRegex(regexObj) {
  return {
    id: regexObj.id,
    script_name: regexObj.scriptName,
    enabled: !regexObj.disabled,
    find_regex: regexObj.findRegex,
    replace_string: regexObj.replaceString,
    trim_strings: regexObj.trimStrings.join('\n'),
    source: {
      user_input: regexObj.placement.includes(1),
      ai_output: regexObj.placement.includes(2),
      slash_command: regexObj.placement.includes(4),
      world_info: regexObj.placement.includes(3),
      reasoning: regexObj.placement.includes(5),
    },
    destination: {
      display: regexObj.markdownOnly,
      prompt: regexObj.promptOnly,
    },
    run_on_edit: regexObj.runOnEdit,
    min_depth: regexObj.minDepth,
    max_depth: regexObj.maxDepth,
  };
}

export function getScriptSyncObjFromUI(prefix, cardId = null) {
  const suffix = cardId ? `-${cardId}` : '';
  const content = $(`#wb-sync-${prefix}-content${suffix}`).val();
  if (!content) return null;

  const scriptName = $(`#wb-sync-${prefix}-script-name${suffix}`).val().trim() || 'Kịch bản trợ giúp mới';
  const bị vô hiệu hóa = $(`#wb-sync-${prefix}-disabled${suffix}`).is(':checked');
  const info = $(`#wb-sync-${prefix}-info${suffix}`).val() || '';

  trở về {
    gõ: 'kịch bản',
    đã bật: !isDisabled,
    tên: scriptName,
    id: tạoUUID(),
    nội dung: nội dung,
    thông tin: thông tin,
    nút: {
      đã bật: sai,
      các nút: [],
    },
    dữ liệu: {},
  };
}

xuất hàm không đồng bộ handRegexImport(prefix, targetType, cardId = null) {
  const RegexObj = getRegexObjFromUI(tiền tố, cardId);
  if (!regexObj) return toastr.warning('Không có nội dung để nhập');
  thử {
    if (!window.TavernHelper) ném ra Lỗi mới('TavernHelper không tải');
    const tavernRegex = ConvertToTavernRegex(regexObj);
    
    hãy targetOpt = { type: targetType };
    if (targetType === 'preset') targetOpt = { type: 'preset', name: 'in_use' };
    if (targetType === 'ký tự') targetOpt = { type: 'character', name: 'current' };

    đang chờ window.TavernHelper.updateTavernRegexWith(
      biểu thức chính quy => {
        biểu thức chính quy.push (TavernRegex);
        trả về biểu thức chính quy;
      },
      mục tiêuOpt,
    );
    const typeName = targetType === 'toàn cầu'? 'tình hình chung' : targetType === 'đặt trước' ? 'Mặc định' : 'địa phương';
    toastr.success(`Đã nhập thành công vào${typeName}Kịch bản thông thường!`);
  } catch (e) {
    toastr.error(`Nhập không thành công: ${e.message}`);
  }
}

export function handleRegexDownload(prefix, cardId = null) {
  const regexObj = getRegexObjFromUI(prefix, cardId);
  if (!regexObj) return toastr.warning('Không có nội dung có thể tải xuống');

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(regexObj, null, 4));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'regex-' + regexObj.scriptName + '.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  toastr.success('Tải xuống thành công!');
}

export function handleRegexFileLoad(e, prefix) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      $(`#wb-sync-${prefix}-script-name`).val(data.scriptName || data.script_name || '');
      $(`#wb-sync-${prefix}-find-regex`).val(data.findRegex || data.find_regex || '');

      let content = data.replaceString || data.replace_string || '';
      content = content.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '');
      $(`#wb-sync-${prefix}-content`).val(content);

      let trimStrings = '';
      if (Array.isArray(data.trimStrings)) {
        trimStrings = data.trimStrings.join('\n');
      } else if (typeof data.trim_strings === 'string') {
        trimStrings = data.trim_strings;
      }
      $(`#wb-sync-${prefix}-trim-strings`).val(trimStrings);

      $(`.wb-sync-${prefix}-placement-cb`).prop('checked', false);
      let placements = data.placement || [];
      if (data.source) {
        if (data.source.user_input) placements.push(1);
        if (data.source.ai_output) placements.push(2);
        if (data.source.world_info) placements.push(3);
        if (data.source.slash_command) placements.push(4);
        if (data.source.reasoning) placements.push(5);
      }
      placements.forEach(val => {
        $(`.wb-sync-${prefix}-placement-cb[value="${val}"]`).prop('checked', true);
      });

      $(`#wb-sync-${prefix}-disabled`).prop('checked', data.disabled || data.enabled === false);
      $(`#wb-sync-${prefix}-run-on-edit`).prop('checked', data.runOnEdit || data.run_on_edit || false);
      $(`#wb-sync-${prefix}-substitute-regex`).val(data.substituteRegex || 0);

      $(`#wb-sync-${prefix}-markdown-only`).prop(
        'checked',
        data.markdownOnly || (data.destination && data.destination.display) || false,
      );
      $(`#wb-sync-${prefix}-prompt-only`).prop(
        'checked',
        data.promptOnly || (data.destination && data.destination.prompt) || false,
      );
      $(`#wb-sync-${prefix}-min-depth`).val(data.minDepth || data.min_depth || '');
      $(`#wb-sync-${prefix}-max-depth`).val(data.maxDepth || data.max_deep || '');

      toastr.success('Kịch bản thông thường đã được nhập thành công!');
    } bắt (lỗi) {
      toastr.error('Không thể phân tích cú pháp tệp JSON: ' + err.message);
    }
    $(`#wb-sync-${prefix}-file-input`).val('');
  };
  reader.readAsText(tệp);
}

xuất hàm không đồng bộ handScriptImport(tiền tố, targetType, cardId = null) {
  const scriptObj = getScriptSyncObjFromUI(tiền tố, cardId);
  if (!scriptObj) return toastr.warning('Không có nội dung để nhập');
  thử {
    if (!window.TavernHelper) ném ra Lỗi mới('TavernHelper chưa được tải');
    đang chờ window.TavernHelper.updateScriptTreesWith(
      kịch bản => {
        scripts.push(scriptObj);
        trả lại tập lệnh;
      },
      {loại: targetType },
    );
    const typeName = targetType === 'toàn cầu'? 'tình hình chung' : targetType === 'đặt trước' ? 'Mặc định' : 'Vai trò';
    toastr.success(`Đã nhập thành công vào${typeName}Thư viện kịch bản!`);
  } catch (e) {
    toastr.error(`Nhập không thành công: ${e.message}`);
  }
}

export function handleScriptDownload(prefix, cardId = null) {
  const scriptObj = getScriptSyncObjFromUI(prefix, cardId);
  if (!scriptObj) return toastr.warning('Không có nội dung có thể tải xuống');

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scriptObj, null, 4));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'Tập lệnh trợ giúp Tavern-' + scriptObj.name + '.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  toastr.success('Tải xuống thành công!');
}

export function handleScriptFileLoad(e, prefix) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      $(`#wb-sync-${prefix}-script-name`).val(data.name || '');
      $(`#wb-sync-${prefix}-content`).val(data.content || '');
      $(`#wb-sync-${prefix}-disabled`).prop('đã kiểm tra', data.enabled === false);

      toastr.success('Tập lệnh hỗ trợ đã được nhập thành công!');
    } bắt (lỗi) {
      toastr.error('Không phân tích được tệp JSON: ' + err.message);
    }
    $(`#wb-sync-${prefix}-file-input`).val('');
  };
  reader.readAsText(file);
}

export async function handleExtractScript(prefix, wrapInCodeBlock = false) {
  const startTag = $(`#wb-sync-${prefix}-tag-start`).val();
  const endTag = $(`#wb-sync-${prefix}-tag-end`).val();
  const floorInput = $(`#wb-sync-${prefix}-floor`).val();

  const extractedTexts = await extractContentFromMessage(startTag, endTag, floorInput);
  if (!extractedTexts) return;

  extractedScriptCards = extractedTexts.map((text, index) => {
    let finalContent = text;
    if (wrapInCodeBlock && !finalContent.startsWith('```')) {
      finalContent = '```html\n' + finalContent + '\n```';
    }
    trở về {
      id: Date.now() + chỉ mục,
      nội dung: nội dung cuối cùng,
      name: `Kịch bản trích xuất ${index + 1}`
    };
  });
  
  renderScriptCards(tiền tố);
  toastr.success(`Đã trích xuất thành công tập lệnh ${extractedScriptCards.length}`);
}

xuất hàm không đồng bộ handExtractFrontend() {
  const startTag = $('#wb-sync-fe-tag-start').val();
  const endTag = $('#wb-sync-fe-tag-end').val();
  const floorInput = $('#wb-sync-fe-floor').val();

  const extractTexts = đang chờ extractContentFromMessage(startTag, endTag, FloorInput);
  if (!extractedTexts) trả về;

  extractFrontendCards = extractTexts.map((văn bản, chỉ mục) => {
    trở về {
      id: Date.now() + chỉ mục,
      Nội dung: văn bản,
      tên: `Trích xuất giao diện người dùng ${index + 1}`
    };
  });

  renderFrontendCards();
  toastr.success(`Đã trích xuất thành công mã giao diện người dùng ${extractedFrontendCards.length}`);
}

hàm xuất addFrontendCard(cardData) {
  trích xuấtFrontendCards.unshift(cardData);
}

hàm xuất handFrontendRender(cardId) {
  const $container = $(`#wb-sync-fe-preview-container-${cardId}`);
  const $btn = $(`.fe-render-btn[data-id="${cardId}"]`);
  
  nếu ($container.is(':visible')) {
    $container.empty().hide();
    $btn.html('👁️ Hiển thị giao diện người dùng');
    return;
  }

  let htmlContent = $(`#wb-sync-fe-content-${cardId}`).val();
  if (!htmlNội dung) return toastr.warning('Không có nội dung có thể hiển thị');

  htmlContent = htmlContent.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/tôi, '');

  const iframe = $('<iframe>', {
    srcdoc: htmlNội dung,
    kiểu: 'chiều rộng: 100%; chiều cao: 400px; đường viền: không có;',
  });
  $container.empty().append(iframe).show();
  $btn.html('🙈 Hủy kết xuất');
}

hàm xuất RemoveFrontendCard(id) {
  extractFrontendCards = extractFrontendCards.filter(c => c.id !== id);
  renderFrontendCards();
}

hàm xuất RemoveScriptCard(id) {
  extractScriptCards = extractScriptCards.filter(c => c.id !== id);
  renderScriptCards('ss');
}

hàm xuất renderFrontendCards() {
  if (extractedFrontendCards.length === 0) {
    $feCardsContainer.html('<div class="wb-sync-empty-msg">Không có mã giao diện người dùng nào được trích xuất. </div>');
    trở lại;
  }

  hãy để html = '';
  const defaultCollapse = isDefaultCollapse();
  extractFrontendCards.forEach(card => {
    const contentStyle = defaultCollapse? 'hiển thị: không có; phần đệm: 15px;' : 'phần đệm: 15px;';
    const iconClass = defaultCollapse? 'fa-chevron-down' : 'fa-chevron-up';
    html += `
    <div class="wb-sync-card" data-id="${card.id}" style="border: 1px solid var(--wb-sync-border); border-radius: 5px; background: rgba(0,0,0,0.2); overflow: hidden;">
      <div class="wb-sync-card-header" style="padding: 10px 15px; background: rgba(0,0,0,0.3); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">${card.name}</span>
        <i class="fa-solid ${iconClass} wb-sync-collapse-icon"></i>
      </div>
      <div class="wb-sync-card-content" style="${contentStyle}">
        <div class="wb-sync-row">
          <div class="wb-sync-group" style="flex: 1">
            <span class="wb-sync-label">Tên tập lệnh:</span>
            <loại đầu vào="text" id="wb-sync-fe-script-name-${card.id}" class="wb-sync-input" style="width: 100%" value="${card.name}" />
          </div>
          <div class="wb-sync-group" style="flex: 1">
            <span class="wb-sync-label">Tìm thường xuyên:</span>
            <loại đầu vào="text" id="wb-sync-fe-find-regex-${card.id}" class="wb-sync-input" style="width: 100%" value="<Mở bảng>" />
          </div>
        </div>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px">
          <div style="display: flex; flex-direction: column; gap: 5px">
            <span class="wb-sync-label" style="font-weight: bold">Phạm vi</span>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" class="wb-sync-fe-placement-cb-${card.id}" value="1" />Đầu vào của người dùng</label>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" class="wb-sync-fe-placement-cb-${card.id}" value="2" đã kiểm tra /> Đầu ra AI</label>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" class="wb-sync-fe-placement-cb-${card.id}" value="4" />Lệnh phím tắt</label>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" class="wb-sync-fe-placement-cb-${card.id}" value="3" />Thông tin thế giới</label>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" class="wb-sync-fe-placement-cb-${card.id}" value="5" /> Lý luận</label>
          </div>
          <kiểu div="display: flex; flex-direction: column; gap: 5px">
            <span class="wb-sync-label" style="font-weight: bold">Các tùy chọn khác</span>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" id="wb-sync-fe-disabled-${card.id}" /> Đã tắt</label>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" id="wb-sync-fe-run-on-edit-${card.id}" đã kiểm tra /> Chạy trong khi chỉnh sửa</label>
            <span lớp="wb-sync-label" style="font-weight: bold; margin-top: 5px">Macro để tìm kiếm biểu thức chính quy</span>
            <chọn id="wb-sync-fe-substitute-regex-${card.id}" class="wb-sync-select" style="width: 120px">
              <option value="0" đã chọn>Không thay thế</option>
              <giá trị tùy chọn="1">Thay thế</option>
            </select>
          </div>
          <kiểu div="display: flex; flex-direction: column; gap: 5px">
            <span class="wb-sync-label" style="font-weight: bold">Tồn tại trong thời gian ngắn</span>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" id="wb-sync-fe-markdown-only-${card.id}" đã chọn />Chỉ hiển thị Text (Markdown)</label>
            <nhãn lớp="wb-sync-checkbox-label"><input type="checkbox" id="wb-sync-fe-prompt-only-${card.id}" />Chỉ hiển thị trong Prompt</label>
            <kiểu div="display: flex; gap: 10px; margin-top: 5px">
              <div style="display: flex; flex-direction: column; gap: 2px">
                <span class="wb-sync-label">Độ sâu tối thiểu</span>
                <loại đầu vào="number" id="wb-sync-fe-min-depth-${card.id}" class="wb-sync-input" style="width: 70px" placeholder="Không giới hạn" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px">
                <span class="wb-sync-label">Độ sâu tối đa</span>
                <loại đầu vào="number" id="wb-sync-fe-max-depth-${card.id}" class="wb-sync-input" style="width: 70px" placeholder="Không giới hạn" />
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; margin-top: 10px;">
          <span class="wb-sync-label">Cắt bỏ:</span>
          <id vùng văn bản="wb-sync-fe-trim-strings-${card.id}" class="wb-sync-textarea" style="min-height: 60px; margin-bottom: 10px" placeholder="Cắt bỏ toàn bộ mọi phần không mong muốn của kết quả khớp biểu thức chính quy trước khi thay thế nó. Tách từng phần tử bằng phím Enter."></textarea>
          <span class="wb-sync-label">Thay thế bằng (mã HTML được trích xuất):</span>
          <id vùng văn bản="wb-sync-fe-content-${card.id}" class="wb-sync-textarea" style="min-height: 150px; font-family: monospace">${card.content}</textarea>
        </div>
        <div class="wb-sync-actions" style="justify-content: flex-end; margin-top: 10px">
          <button class="wb-sync-button fe-import-global-btn" data-id="${card.id}">Nhập vào biểu thức chính quy chung</button>
          <lớp nút="wb-sync-button fe-import-preset-btn" data-id="${card.id}">Nhập vào biểu thức chính quy mặc định</button>
          <lớp nút="wb-sync-button fe-import-character-btn" data-id="${card.id}">Nhập vào biểu thức chính quy cục bộ</button>
          <lớp nút="wb-sync-button fe-render-btn" data-id="${card.id}">👁️Hiển thị giao diện người dùng</button>
          <lớp nút="wb-sync-button wb-sync-btn-primary fe-download-btn" data-id="${card.id}">⬇️ Tải xuống dưới dạng tập lệnh thông thường</button>
          <lớp nút="wb-sync-button wb-sync-btn-small abandon fe-delete-btn" data-id="${card.id}">🗑️ Xóa</button>
        </div>
        <div id="wb-sync-fe-preview-container-${card.id}" style="display: none; margin-top: 15px; border: 1px solid var(--wb-sync-border); border-radius: 5px; padding: 10px; background: #fff; color: #000; overflow: auto; min-height: 300px;"></div>
      </div>
    </div>
  `;
  });

  $feCardsContainer.html(html);
}

export function renderScriptCards(prefix) {
  const $container = $(`#wb-sync-${prefix}-cards-container`);
  if (extractedScriptCards.length === 0) {
    $container.html('<div class="wb-sync-empty-msg">Không có mã tập lệnh nào được trích xuất.</div>');
    trở lại;
  }

  hãy để html = '';
  const defaultCollapse = isDefaultCollapse();
  extractScriptCards.forEach(card => {
    const contentStyle = defaultCollapse? 'hiển thị: không có; phần đệm: 15px;' : 'phần đệm: 15px;';
    const iconClass = defaultCollapse? 'fa-chevron-down' : 'fa-chevron-up';
    html += `
    <div class="wb-sync-card" data-id="${card.id}" style="border: 1px solid var(--wb-sync-border); border-radius: 5px; background: rgba(0,0,0,0.2); overflow: hidden;">
      <div class="wb-sync-card-header" style="padding: 10px 15px; background: rgba(0,0,0,0.3); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">${card.name}</span>
        <i class="fa-solid ${iconClass} wb-sync-collapse-icon"></i>
      </div>
      <div class="wb-sync-card-content" style="${contentStyle}">
        <div class="wb-sync-row">
          <div class="wb-sync-group" style="flex: 1">
            <span class="wb-sync-label">Tên tập lệnh:</span>
            <loại đầu vào="text" id="wb-sync-${prefix}-script-name-${card.id}" class="wb-sync-input" style="width: 100%" value="${card.name}" />
          </div>
        </div>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px">
          <div style="display: flex; flex-direction: column; gap: 5px">
            <label class="wb-sync-checkbox-label"><input type="checkbox" id="wb-sync-${prefix}-disabled-${card.id}" /> Đã tắt</label>
          </div>
        </div>
        <kiểu div="display: flex; flex-direction: column; margin-top: 10px;">
          <span class="wb-sync-label">Nội dung tập lệnh được trích xuất (JS/TS):</span>
          <id vùng văn bản="wb-sync-${prefix}-content-${card.id}" class="wb-sync-textarea" style="min-height: 150px; font-family: monospace">${card.content}</textarea>
          <span class="wb-sync-label" style="margin-top: 10px">Ghi chú của tác giả:</span>
          <id vùng văn bản="wb-sync-${prefix}-info-${card.id}" class="wb-sync-textarea" style="min-height: 60px" placeholder="Nhận xét tập lệnh, chẳng hạn như tên tác giả, phiên bản và ghi chú, hỗ trợ đánh dấu đơn giản và html"></textarea>
        </div>
        <div class="wb-sync-actions" style="justify-content: flex-end; margin-top: 10px; flex-wrap: wrap">
          <button class="wb-sync-button ss-import-global-btn" data-id="${card.id}" style="background-color: var(--wb-sync-primary); color: #000; opacity: 1">Nhập vào thư viện tập lệnh chung</button>
          <lớp nút="wb-sync-button ss-import-preset-btn" data-id="${card.id}" style="background-color: var(--wb-sync-primary); color: #000; opacity: 1">Nhập vào Thư viện Script Preset</button>
          <lớp nút="wb-sync-button ss-import-character-btn" data-id="${card.id}" style="background-color: var(--wb-sync-primary); color: #000; opacity: 1">Nhập vào Thư viện Script Nhân vật</button>
          <lớp nút="wb-sync-button wb-sync-btn-primary ss-download-btn" data-id="${card.id}" style="opacity: 1">⬇️Tải tập lệnh xuống</button>
          <lớp nút="wb-sync-button wb-sync-btn-small abandon ss-delete-btn" data-id="${card.id}">🗑️ Xóa</button>
        </div>
      </div>
    </div>
  `;
  });

  $container.html(html);
}
