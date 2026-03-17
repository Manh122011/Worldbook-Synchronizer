import { escapeHtml } from '../utils.js';
import { isManageRegexCollapsed } from './settings.js';

let $manageRegexGlobalList;
let $manageRegexPresetList;
let $manageRegexCharacterList;
let $manageRegexEditPanel;
let currentRegexes = [];
let currentRegexId = '';
let currentRegexType = '';
let renderDebounceTimer = null;

export function initManageRegex() {
  $manageRegexGlobalList = $('#wb-sync-manage-regex-global-list');
  $manageRegexPresetList = $('#wb-sync-manage-regex-preset-list');
  $manageRegexCharacterList = $('#wb-sync-manage-regex-character-list');
  $manageRegexEditPanel = $('#wb-sync-manage-regex-edit-panel');

  $('#wb-sync-manage-regex-refresh-btn').on('click', debouncedRender);
  $('#wb-sync-manage-regex-save-btn').on('click', handleSaveRegex);
  $('#wb-sync-manage-regex-cancel-btn').on('click', hideRegexEditPanel);
  $('#wb-sync-manage-regex-render-btn').on('click', handleRenderToFrontend);

  $('#wb-sync-manage-regex-edit-panel .wb-sync-edit-panel-header').on('click', function(e) {
    if ($(e.target).closest('.wb-sync-card-header-actions').length) return;
    const $panel = $(this).closest('.wb-sync-edit-panel-collapsible');
    $panel.toggleClass('collapsed');
  });

  $('#wb-sync-manage-regex-view').on('click', '.wb-sync-manage-script-card-header', function() {
    const targetId = $(this).data('target');
    if (targetId && targetId.startsWith('wb-sync-manage-regex')) {
      const $card = $(this).closest('.wb-sync-manage-script-card');
      $card.toggleClass('collapsed');
      const isCollapsed = $card.hasClass('collapsed');
      localStorage.setItem(`wb-sync-regex-card-${targetId}`, được thu gọn ? 'thu gọn' : 'mở rộng');
    }
  });

  khôi phụcRegexCardStates();

  $('#wb-sync-manage-regex-view').on('click', '.wb-sync-manage-regex-item', function(e) {
    if ($(e.target).hasClass('wb-sync-manage-regex-enabled') || 
        $(e.target).closest('.wb-sync-manage-regex-actions').length) {
      trở lại;
    }
    constregexId = $(this).data('regex-id');
    const type = $(this).closest('.wb-sync-manage-script-card-content').attr('id').replace('wb-sync-manage-regex-', '').replace('-list', '');
    openRegexEditPanel(regexId, type);
  });

  $('#wb-sync-manage-regex-view').on('change', '.wb-sync-manage-regex-enabled', function(e) {
    e.stopPropagation();
    constregexId = $(this).closest('.wb-sync-manage-regex-item').data('regex-id');
    const isEnabled = $(this).is(':checked');
    const type = $(this).closest('.wb-sync-manage-script-card-content').attr('id').replace('wb-sync-manage-regex-', '').replace('-list', '');
    chuyển đổiRegexEnabled(regexId, type, isEnabled);
  });

  $('#wb-sync-manage-regex-view').on('click', '.wb-sync-manage-regex-delete', function(e) {
    e.stopPropagation();
    constregexId = $(this).closest('.wb-sync-manage-regex-item').data('regex-id');
    const type = $(this).closest('.wb-sync-manage-script-card-content').attr('id').replace('wb-sync-manage-regex-', '').replace('-list', '');
    xóaRegex(regexId, type);
  });

  $('#wb-sync-manage-regex-substitute-regex').on('change', function() {
    const val = $(this).val();
    $('#wb-sync-manage-regex-min-deep-container').css('display', val === '1' ? 'flex' : 'none');
    $('#wb-sync-manage-regex-max-deep-container').css('display', val === '1' ? 'flex' : 'none');
  });
}

hàm debouncedRender() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    renderQuản lýRegexLists();
  }, 100);
}

hàm xuất renderQuản lýRegexLists() {
  if (!window.TavernHelper) {
    const msg = '<div class="wb-sync-empty-msg">TavernHelper không tải</div>';
    $manageRegexGlobalList.html(tin nhắn);
    $manageRegexPresetList.html(tin nhắn);
    $manageRegexCharacterList.html(msg);
    trở lại;
  }

  const isCharacterSelected = SillyTavern.getContext().characterId !== không xác định;
  
  const $characterCard = $('.wb-sync-manage-script-card-header[data-target="wb-sync-manage-regex-character-list"]').closest('.wb-sync-manage-script-card');
  if (isCharacterSelected) {
    $characterCard.show();
  } khác {
    $characterCard.hide();
  }

  thử {
    const GlobalRegexes = LoadRegexsWithCache('global');
    const presetRegexes = LoadRegexsWithCache('preset');
    const characterRegexes = LoadRegexsWithCache('character');

    renderRegexList($manageRegexGlobalList, GlobalRegexes, 'global');
    renderRegexList($manageRegexPresetList, PresetRegexes, 'preset');
    
    if (isCharacterSelected) {
      renderRegexList($manageRegexCharacterList, characterRegexes, 'character');
    }
  } bắt (e) {
    console.error('Không tải được biểu thức chính quy:', e);
    $manageRegexGlobalList.html('<div class="wb-sync-empty-msg">Tải không thành công</div>');
    $manageRegexPresetList.html('<div class="wb-sync-empty-msg">Tải không thành công</div>');
    $manageRegexCharacterList.html('<div class="wb-sync-empty-msg">Tải không thành công</div>');
  }
}

hàm tảiRegexsWithCache(type) {
  hãy để biểu thức chính quy = [];
  if (loại === 'toàn cầu') {
    biểu thức chính quy = window.TavernHelper.getTavernRegexes({ type: 'global' }) || [];
  } else if (loại === 'đặt trước') {
    biểu thức chính quy = window.TavernHelper.getTavernRegexes({ type: 'preset', name: 'in_use' }) || [];
  } else if (loại === 'ký tự') {
    biểu thức chính quy = window.TavernHelper.getTavernRegexes({ type: 'character', name: 'current' }) || [];
  }
  
  const đã lưuOrder = JSON.parse(localStorage.getItem(`wb-sync-regexes-order-${type}`) || '[]');
  
  if (savedOrder.length > 0) {
    const regrecMap = Bản đồ mới();
    biểu thức chính quy.forEach(regex => biểu thức chính quy.set(Chuỗi(regex.id), biểu thức chính quy));
    const được sắp xếpRegexes = [];
    đã lưuOrder.forEach(id => {
      const Regex = RegexMap.get(String(id));
      if (regex) được sắp xếpRegexes.push(regex);
    });
    biểu thức chính quy.forEach(regex => {
      if (!sortedRegexes.find(r => r.id ===regex.id)) {
        sắp xếpRegexes.push(regex);
      }
    });
    trả về các Regexes được sắp xếp;
  } khác {
    trả về biểu thức chính quy.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }
}

hàm renderRegexList ($container, biểu thức chính quy, loại) {
  if (regexes.length === 0) {
    $container.html('<div class="wb-sync-empty-msg">Không có tập lệnh thông thường. </div>');
    trở lại;
  }

  đoạn const = document.createDocumentFragment();
  biểu thức chính quy.forEach(regex => {
    const div = document.createElement('div');
    div.className = 'wb-sync-manage-regex-item';
    div.setAttribution('data-regex-id', Regex.id);
    div.innerHTML = `
      <div class="wb-sync-manage-regex-info">
        <input type="checkbox" class="wb-sync-manage-regex-enabled" ${regex.enabled !== false ? 'checked' : ''}>
        <span class="wb-sync-manage-regex-name">${escapeHtml(regex.script_name || 'Thông thường chưa được đặt tên')</span>
      </div>
      <lớp div="wb-sync-manage-regex-actions">
        <button class="wb-sync-button wb-sync-btn-small wb-sync-manage-regex-delete">xóa bỏ</button>
      </div>
    `;
    đoạn.appendChild(div);
  });
  $container.empty().append(đoạn);
}

chức năng không đồng bộ chuyển đổiRegexEnabled(regexId, type, isEnabled) {
  thử {
    hãy targetOpt = { type: type };
    if (type === 'preset') targetOpt = { type: 'preset', name: 'in_use' };
    if (type === 'ký tự') targetOpt = { type: 'character', name: 'current' };

    đang chờ window.TavernHelper.updateTavernRegexesWith(regexes => {
      const Regex = Regexes.find(r => r.id === RegexId);
      if (regex) regrec.enabled = isEnabled;
      trả về biểu thức chính quy;
    }, targetOpt);
    toastr.success(isEnabled ? 'Đã bật Regex' : 'Regex bị vô hiệu hóa');
  } bắt (e) {
    toastr.error('更新失败:' + e.message);
    renderQuản lýRegexLists();
  }
}

hàm không đồng bộ openRegexEditPanel(regexId, type) {
  thử {
    hãy targetOpt = { type: type };
    if (type === 'preset') targetOpt = { type: 'preset', name: 'in_use' };
    if (type === 'ký tự') targetOpt = { type: 'character', name: 'current' };

    const biểu thức chính quy = đang chờ window.TavernHelper.getTavernRegexes(targetOpt) || [];
    const Regex = Regexes.find(r => r.id === RegexId);

    if (!regex) trả về;

    currentRegexes = biểu thức chính quy;
    currentRegexId = RegexId;
    currentRegexType = loại;

    $('#wb-sync-manage-regex-id').val(regex.id);
    $('#wb-sync-manage-regex-script-name').val(regex.script_name || '');
    $('#wb-sync-manage-regex-find-regex').val(regex.find_regex || '');
    $('#wb-sync-manage-regex-replace-string').val(regex.replace_string || '');
    $('#wb-sync-manage-regex-trim-strings').val(regex.trim_strings || '');
    $('#wb-sync-manage-regex-enabled').prop('checked', Regex.enabled !== false);
    $('#wb-sync-manage-regex-run-on-edit').prop('checked', Regex.run_on_edit || false);
    $('#wb-sync-manage-regex-substitute-regex').val(regex.substitute_regex || 0);
    $('#wb-sync-manage-regex-min-deep').val(regex.min_deep || '');
    $('#wb-sync-manage-regex-max-deep').val(regex.max_deep || '');

    $('.wb-sync-manage-regex-placement-cb').prop('checked', false);
    if (regex.source) {
      $('.wb-sync-manage-regex-placement-cb[value="1"]').prop('checked',regex.source.user_input);
      $('.wb-sync-manage-regex-placement-cb[value="2"]').prop('checked',regex.source.ai_output);
      $('.wb-sync-manage-regex-placement-cb[value="4"]').prop('checked',regex.source.slash_command);
      $('.wb-sync-manage-regex-placement-cb[value="3"]').prop('checked',regex.source.world_info);
      $('.wb-sync-manage-regex-placement-cb[value="5"]').prop('checked',regex.source.reasoning);
    }

    $('#wb-sync-manage-regex-markdown-only').prop('checked', Regex.destination ? Regex.destination.display : false);
    $('#wb-sync-manage-regex-Prompt-only').prop('checked',regex.destination ?regex.destination.prompt : false);

    $('#wb-sync-manage-regex-min-deep-container').css('display',regreg.substitute_regex === 1 ? 'flex' : 'none');
    $('#wb-sync-manage-regex-max-deep-container').css('display', Regex.substitute_regex === 1 ? 'flex' : 'none');

    $manageRegexEditPanel.removeClass('collapsed').show();
    $manageRegexEditPanel.find('.wb-sync-manage-regex-edit-title').text(`Chỉnh sửa ${type === 'global' ? 'tình hình chung' : type === 'preset' ? 'Mặc định' : 'địa phương'}thường xuyên`);
  } bắt (e) {
    toastr.error('Không tải được biểu thức chính quy:' + e.message);
  }
}

hàm ẩnRegexEditPanel() {
  $manageRegexEditPanel.removeClass('collapsed').hide();
  currentRegexId = '';
  currentRegexType = '';
}

hàm không đồng bộ xử lýSaveRegex() {
  if (!currentRegexId || !currentRegexType) trả về;

  thử {
    hãy targetOpt = { type: currentRegexType };
    if (currentRegexType === 'preset') targetOpt = { type: 'preset', name: 'in_use' };
    if (currentRegexType === 'character') targetOpt = { type: 'character', name: 'current' };

    đang chờ window.TavernHelper.updateTavernRegexesWith(regexes => {
      const biểu thức chính quy = biểu thức chính quy.find(r => r.id === currentRegexId);
      nếu (regex) {
        Regex.script_name = $('#wb-sync-manage-regex-script-name').val();
        Regex.find_regex = $('#wb-sync-manage-regex-find-regex').val();
        Regex.replace_string = $('#wb-sync-manage-regex-replace-string').val();
        Regex.trim_strings = $('#wb-sync-manage-regex-trim-strings').val();
        Regex.enabled = $('#wb-sync-manage-regex-enabled').is(':checked');
        Regex.run_on_edit = $('#wb-sync-manage-regex-run-on-edit').is(':checked');
        Regex.substitute_regex = ParseInt($('#wb-sync-manage-regex-substitute-regex').val()) || 0;
        regrec.min_deep = $('#wb-sync-manage-regex-min-deep').val() !== '' ? ParseInt($('#wb-sync-manage-regex-min-deep').val()) : null;
        regrec.max_deep = $('#wb-sync-manage-regex-max-deep').val() !== '' ? ParseInt($('#wb-sync-manage-regex-max-deep').val()) : null;

        biểu thức chính quy.nguồn = {
          user_input: $('.wb-sync-manage-regex-placement-cb[value="1"]').is(':checked'),
          ai_output: $('.wb-sync-manage-regex-placement-cb[value="2"]').is(':checked'),
          dấu gạch chéo_command: $('.wb-sync-manage-regex-placement-cb[value="4"]').is(':checked'),
          world_info: $('.wb-sync-manage-regex-placement-cb[value="3"]').is(':checked'),
          lý do: $('.wb-sync-manage-regex-placement-cb[value="5"]').is(':checked'),
        };

        biểu thức chính quy.destination = {
          hiển thị: $('#wb-sync-manage-regex-markdown-only').is(':checked'),
          lời nhắc: $('#wb-sync-manage-regex-prompt-only').is(':checked'),
        };
      }
      trả về biểu thức chính quy;
    }, targetOpt);

    toastr.success('保存成功!');
    ẩnRegexEditPanel();
    renderQuản lýRegexLists();
  } bắt (e) {
    toastr.error('保存失败:' + e.message);
  }
}

chức năng khôi phụcRegexCardStates() {
  thẻ const = [
    'wb-sync-manage-regex-global-list',
    'wb-sync-manage-regex-preset-list',
    'wb-sync-quản lý-regex-danh sách ký tự'
  ];

  const defaultCollapsed = isManagerRegexCollapsed();

  cards.forEach(cardId => {
    const đã lưuState = localStorage.getItem(`wb-sync-regex-card-${cardId}`);
    if (savedState === 'collapsed' || (savedState === null && defaultCollapsed)) {
      $(`.wb-sync-manage-script-card-header[data-target="${cardId}"]`).closest('.wb-sync-manage-script-card').addClass('collapsed');
    }
  });
}

hàm xử lýRenderToFrontend() {
  const $container = $('#wb-sync-manage-regex-preview-container');
  const $btn = $('#wb-sync-manage-regex-render-btn');

  if ($container.is(':visible')) {
    $container.empty().hide();
    $btn.html('👁️ Kết xuất');
    trở lại;
  }

  hãy để htmlContent = $('#wb-sync-manage-regex-replace-string').val();
  if (!htmlNội dung) {
    toastr.warning('Không có nội dung để hiển thị');
    trở lại;
  }

  htmlContent = htmlContent.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '');

  const iframe = $('<iframe>', {
    srcdoc: htmlContent,
    style: 'width: 100%; height: 400px; border: none;',
  });
  $container.empty().append(iframe).show();
  $btn.html('🙈 Hủy kết xuất');
}

async function deleteRegex(regexId, type) {
  if (!confirm('Bạn có chắc chắn muốn xóa tập lệnh thông thường này không?')) return;

  try {
    let targetOpt = { type: type };
    if (type === 'preset') targetOpt = { type: 'preset', name: 'in_use' };
    if (type === 'character') targetOpt = { type: 'character', name: 'current' };

    await window.TavernHelper.updateTavernRegexesWith(regexes => {
      return regexes.filter(r => r.id !== regexId);
    }, targetOpt);

    toastr.success('Xóa thành công');
    renderManageRegexLists();
    if (currentRegexId === regexId) hideRegexEditPanel();
  } catch (e) {
    toastr.error('Xóa không thành công:' + e.message);
  }
}

export function cleanup() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
}