import { getAllLorebooks, getLorebookEntries, setLorebookEntries, getTavernHelper } from '../api.js';
import { escapeHtml } from '../utils.js';
import { showLoader, hideLoader } from '../ui.js';

let $worldbookListContainer;
let $constantEntriesContainer;
let $normalEntriesContainer;
let $modifyWbSelect;
let $modifyEntrySelect;
let $modifyContent;
let $modifyDetails;
let $modName;
let $modKeys;
let $modContent;
let $modMode;
let $modPosition;
let $modDepthContainer;
let $modDepth;
let $modOrder;
let $modProb;
let $modPreventIn;
let $modPreventOut;
let $transSourceSelect;
let $transTargetSelect;
let $copySourceSelect;
let $copyTargetSelect;
let $transEntriesContainer;
let $copyEntriesContainer;
let $transSelectAllBtn;
let $copySelectAllBtn;
let $transBtn;
let $copyBtn;

export function initEntries() {
  $worldbookListContainer = $('#wb-sync-worldbook-list-container');
  $constantEntriesContainer = $('#wb-sync-constant-entries-container');
  $normalEntriesContainer = $('#wb-sync-normal-entries-container');
  $modifyWbSelect = $('#wb-sync-worldbook-select');
  $modifyEntrySelect = $('#wb-sync-entry-select');
  $modifyContent = $('#wb-sync-selected-entry-content');
  $modifyDetails = $('#wb-sync-modify-details');
  $modName = $('#wb-sync-mod-name');
  $modKeys = $('#wb-sync-mod-keys');
  $modContent = $('#wb-sync-mod-content');
  $modMode = $('#wb-sync-mod-mode');
  $modPosition = $('#wb-sync-mod-position');
  $modDepthContainer = $('#wb-sync-mod-depth-container');
  $modDepth = $('#wb-sync-mod-depth');
  $modOrder = $('#wb-sync-mod-order');
  $modProb = $('#wb-sync-mod-prob');
  $modPreventIn = $('#wb-sync-mod-prevent-in');
  $modPreventOut = $('#wb-sync-mod-prevent-out');
  $transSourceSelect = $('#wb-sync-source-worldbook-select');
  $transTargetSelect = $('#wb-sync-target-worldbook-select');
  $copySourceSelect = $('#wb-sync-copy-source-worldbook-select');
  $copyTargetSelect = $('#wb-sync-copy-target-worldbook-select');
  $transEntriesContainer = $('#wb-sync-source-entries-container');
  $copyEntriesContainer = $('#wb-sync-copy-source-entries-container');
  $transSelectAllBtn = $('#wb-sync-transfer-select-all-btn');
  $copySelectAllBtn = $('#wb-sync-copy-select-all-btn');
  $transBtn = $('#wb-sync-transfer-entries-btn');
  $copyBtn = $('#wb-sync-copy-entries-btn');

  $('#wb-sync-delete-entry-btn').on('click', handleDeleteEntries);
  $modifyWbSelect.on('change', populateModifyEntrySelect);
  $modifyEntrySelect.on('change', handleModifyEntryChange);
  $('#wb-sync-save-manual-changes-btn').on('click', handleManualSave);

  $modPosition.on('change', function () {
    const val = $(this).val();
    $modDepthContainer.css('display', val.startsWith('at_depth') ? 'flex' : 'none');
  });

  $transSourceSelect.on('change', renderSourceEntries);
  $transBtn.on('click', handleTransferEntries);
  $transSelectAllBtn.on('click', () => {
    const checkboxes = $transEntriesContainer.find('input[type="checkbox"]');
    const allChecked = checkboxes.length === checkboxes.filter(':checked').length;
    checkboxes.prop('checked', !allChecked);
  });

  $copySourceSelect.on('change', renderCopySourceEntries);
  $copyBtn.on('click', handleCopyEntries);
  $copySelectAllBtn.on('click', () => {
    const checkboxes = $copyEntriesContainer.find('input[type="checkbox"]');
    const allChecked = checkboxes.length === checkboxes.filter(':checked').length;
    checkboxes.prop('checked', !allChecked);
  });

  $constantEntriesContainer.on('click', '.wb-sync-book-button', function () {
    $(this).toggleClass('selected');
  });
  $normalEntriesContainer.on('click', '.wb-sync-book-button', function () {
    $(this).toggleClass('selected');
  });
}

export async function loadEntriesForSelectedBooks() {
  $constantEntriesContainer.empty();
  $normalEntriesContainer.empty();
  const selectedBooks = $worldbookListContainer.find('.selected');
  if (selectedBooks.length === 0) {
    $constantEntriesContainer.html('<p class="wb-sync-no-tasks">Vui lòng chọn Sách thế giới trước. </p>');
    $normalEntriesContainer.html('');
    trở lại;
  }

  thử {
    const bookNames = selectedBooks.map((_, el) => $(el).data('book-name')).get();
    const allEntriesPromises = bookNames.map(bookName => getLorebookEntries(bookName).then(entries => ({ bookName,entry })));
    kết quả const = đang chờ Promise.all(allEntriesPromises);

    hãy để constantHtml = '';
    hãy bình thườngHtml = '';

    results.forEach(({ bookName,entry }) => {
      mục.forEach(e => {
        nút constHtml = `<class nút="wb-sync-book-button" data-uid="${e.uid}" data-book-name="${escapeHtml(bookName)}" title="${escapeHtml(e.comment || `UID:${e.uid}`)}">${escapeHtml(e.comment || `UID:${e.uid}`)}</button>`;
        if (e.type === 'hằng số') {
          constantHtml += nútHtml;
        } khác {
          normalHtml += nútHtml;
        }
      });
    });

    $constantEntriesContainer.html(constantHtml || '<p class="wb-sync-no-tasks">Không có mục nào có ánh sáng xanh.</p>');
    $normalEntriesContainer.html(normalHtml || '<p class="wb-sync-no-tasks">Không có mục nhập màu xanh lá cây.</p>');

  } bắt (e) {
    toastr.error('Tải mục nhập không thành công: ' + e.message);
    $constantEntriesContainer.html('<p style="color:red;">Tải không thành công</p>');
    $normalEntriesContainer.html('');
  }
}

xuất hàm xử lý không đồng bộDeleteEntries() {
  const đã chọn = $('#wb-sync-constant-entries-container .selected, #wb-sync-normal-entries-container .selected');
  if (selected.length === 0) return toastr.warning('Vui lòng chọn các mục cần xóa');
  const toDelete = {};
  đã chọn.each((_, el) => {
    const b = $(el).data('book-name'),
      u = ParseInt($(el).data('uid'));
    if (!toDelete[b]) toDelete[b] = [];
    toDelete[b].push(u);
  });
  nếu (xác nhận(`Xác nhận xóa vĩnh viễn ${selected.length} mặt hàng?`)) {
    thử {
      const api = đang chờ getTavernHelper();
      for (const b in toDelete) đang chờ api.deleteLorebookEntries(b, toDelete[b]);
      toastr.success('Xóa thành công');
      LoadEntriesForSelectedBooks();
    } bắt (e) {
      toastr.error('Xóa không thành công');
    }
  }
}

xuất hàm không đồng bộ populateModifyWorldbookSelect() {
  thử {
    const books = đang chờ getAllLorebooks();
    $modifyWbSelect.empty().append('<option value="">--Vui lòng chọn Sách thế giới--</option>');
    books.forEach(b =>
      $modifyWbSelect.append(`<option value="${escapeHtml(b.file_name)}">${escapeHtml(b.name)}</option>`),
    );
    $modifyEntrySelect.empty().append('<option value="">--Chọn Sách Thế giới trước--</option>');
  } bắt (e) {
    $modifyWbSelect.empty().append('<option value="">Tải không thành công</option>');
  }
}

xuất hàm không đồng bộ populateModifyEntrySelect() {
  const book = $modifyWbSelect.val();
  $modifyContent.val('');
  if (!book) return $modifyEntrySelect.empty().append('<option value="">--Chọn sách thế giới trước--</option>');
  $modifyEntrySelect.empty().append('<option value="">Đang tải...</option>');
  thử {
    const mục = đang chờ getLorebookEntries(sách);
    $modifyEntrySelect.data('entries',entry).empty();
    if (entries.length === 0) return $modifyEntrySelect.append('<option value="">Không được vào</option>');
    $modifyEntrySelect.append('<option value="">--Chọn mục nhập--</option>');
    mục.forEach(e =>
      $modifyEntrySelect.append(`<option value="${e.uid}">${escapeHtml(e.comment || `UID:${e.uid}`)}</option>`),
    );
  } catch (e) {
    $modifyEntrySelect.empty().append('<option value="">Tải không thành công</option>');
  }
}

hàm xuất handModifyEntryChange() {
  const uid = $modifyEntrySelect.val(),
    mục = $modifyEntrySelect.data('entries') || [];

  nếu (uid) {
    const e =entry.find(x => x.uid == uid);
    nếu (e) {
      $modName.val(e.name || e.comment || '');
      $modKeys.val(
        e.strategy && e.strategy.keys ? e.strategy.keys.join(', '): e.key ? e.key.join(', ') : '',
      );
      $modContent.val(e.content || '');

      chế độ const = e.strategy && e.strategy.type ? e.strategy.type : e.type === 'hằng số' ? 'hằng số' : 'chọn lọc';
      $modMode.val(chế độ);

      hãy để posVal = 'trước_author_note';
      hãy showDepth = false;

      if (e.position && e.position.type) {
        if (e.position.type === 'at_deep') {
          posVal = `at_deep_${e.position.role || 'hệ thống'}`;
          $modDepth.val(e.position.deep || 4);
          showDepth = đúng;
        } khác {
          posVal = e.position.type;
        }
      } else if (e.position !== không xác định) {
        const p = ParseInt(e.position);
        if (p === 0) posVal = 'trước_character_def định';
        khác nếu (p === 1) posVal = 'after_character_def định';
        khác nếu (p === 2) posVal = 'trước_example_messages';
        khác nếu (p === 3) posVal = 'after_example_messages';
        khác nếu (p === 4) posVal = 'Before_author_note';
        khác nếu (p === 5) posVal = 'after_author_note';
        khác nếu (p >= 6 && p <= 8) {
          posVal = p === 6 ? 'at_deep_system' : p === 7 ? 'at_deep_user' : 'at_deep_assistant';
          $modDepth.val(e.deep || 4);
          showDepth = đúng;
        }
      }

      $modPosition.val(posVal);
      $modDepthContainer.css('display', showDepth ? 'flex' : 'none');

      $modOrder.val(e.position && e.position.order !== không xác định ? e.position.order : e.order || 100);
      $modProb.val(e.xác suất !== không xác định ? e.xác suất : 100);

      const pIn = e.recursion ? e.recursion.prevent_incoming : e.prevent_recursion || SAI;
      const pOut = e.recursion ? e.recursion.prevent_outending : e.prevent_recursion || SAI;
      $modPreventIn.prop('đã kiểm tra', pIn);
      $modPreventOut.prop('đã kiểm tra', pOut);

      $modifyDetails.css('display', 'flex');
    }
  } khác {
    $modifyDetails.hide();
  }
}

xuất hàm không đồng bộ handManualSave() {
  const book = $modifyWbSelect.val(),
    uid = $modifyEntrySelect.val();
  if (!book || !uid) return notification('Vui lòng chọn một cuốn sách thế giới và mục nhập');
  thử {
    hãy để các mục = đang chờ getLorebookEntries(sách);
    const idx =entry.findIndex(e => e.uid == uid);
    if (idx === -1) ném Lỗi mới('Không tìm thấy mục nhập');

    const e = mục [idx];
    e.name = $modName.val();
    e.comment = e.name;
    e.content = $modContent.val();

    const keyStr = $modKeys.val();
    const keyArr = keyStr
      ? phímStr
          .split(',')
          .map(k => k.trim())
          .filter(k => k)
      : [];

    if (!e.strategy) e.strategy = {};
    e.strategy.type = $modMode.val();
    e.strategy.keys = keyArr;
    e.type = e.strategy.type === 'không đổi' ? 'hằng' : 'Bình thường';
    e.key = keyArr;

    const posVal = $modPosition.val();
    if (!e.position || typeof e.position !== 'object') e.position = { order: e.order || 100 };

    if (posVal.startsWith('at_deep')) {
      e.position.type = 'at_deep';
      e.position.role = posVal.split('_')[2];
      e.position.deep = parsingInt($modDepth.val()) || 4;
    } khác {
      e.position.type = posVal;
    }

    e.position.order = ParseInt($modOrder.val()) || 100;
    e.order = e.position.order;

    e.probability = ParseInt($modProb.val());
    if (isNaN(e.probability)) e.probability = 100;

    if (!e.recursion) e.recursion = {};
    e.recursion.prevent_incoming = $modPreventIn.is(':checked');
    e.recursion.prevent_outending = $modPreventOut.is(':checked');

    đang chờ setLorebookEntries(sách, mục);
    cảnh báo('保存成功!');
    $modifyEntrySelect.data('entries',entry);
  } bắt (e) {
    cảnh báo(`Lưu không thành công: ${e.message}`);
  }
}

xuất hàm không đồng bộ populateTransferSelects() {
  $transEntriesContainer.html('<p class="wb-sync-no-tasks"> Vui lòng chọn sách thế giới nguồn trước. </p>');
  $copyEntriesContainer.html('<p class="wb-sync-no-tasks"> Vui lòng chọn sách thế giới nguồn trước. </p>');
  if ($transSelectAllBtn) $transSelectAllBtn.hide();
  if ($copySelectAllBtn) $copySelectAllBtn.hide();
  thử {
    const books = đang chờ getAllLorebooks();
    const ph = '<giá trị tùy chọn="">--Xin hãy chọn Sách Thế Giới--</option>';
    $transSourceSelect.empty().append(ph);
    $transTargetSelect.empty().append(ph);
    $copySourceSelect.empty().append(ph);
    $copyTargetSelect.empty().append(ph);
    books.forEach(b => {
      const opt = `<giá trị tùy chọn="${escapeHtml(b.file_name)}">${escapeHtml(b.name)</option>`;
      $transSourceSelect.append(opt);
      $transTargetSelect.append(opt);
      $copySourceSelect.append(opt);
      $copyTargetSelect.append(opt);
    });
  } bắt (e) {
    toastr.error('Tải không thành công');
  }
}

xuất hàm không đồng bộ renderSourceEntries() {
  const src = $transSourceSelect.val();

  $transTargetSelect.find('option').prop('disabled', false);
  nếu (src) {
      $transTargetSelect.find(`option[value="${escapeHtml(src)}"]`.prop('disabled', true);
      if ($transTargetSelect.val() === src) $transTargetSelect.val('');
  }

  nếu (!src) {
      $transSelectAllBtn.hide();
      return $transEntriesContainer.html('<p class="wb-sync-no-tasks">Vui lòng chọn sách thế giới nguồn trước. </p>');
  }
  $transEntriesContainer.html('<p>Đang tải...</p>');
  thử {
    const mục = đang chờ getLorebookEntries(src);
    $transEntriesContainer.data('entries',entry).empty();
    if (entry.length === 0) {
        $transSelectAllBtn.hide();
        return $transEntriesContainer.html('<p class="wb-sync-no-tasks">Không có mục nào. </p>');
    }
    $transSelectAllBtn.show();
    hãy để html = '';
    mục.forEach(e => {
      hằng số id = `trans-entry-${e.uid}`;
      const blueIcon = '<span style="display: khối nội tuyến; chiều rộng: 10px; chiều cao: 10px; bán kính đường viền: 50%; đường viền: 2px màu đen đặc; màu nền: #0078d7; lề phải: 6px; căn chỉnh dọc: giữa;" title="Ánh sáng xanh (vĩnh viễn)"></span>';
      const greenIcon = '<span style="display: khối nội tuyến; chiều rộng: 10px; chiều cao: 10px; bán kính đường viền: 50%; đường viền: 2px màu đen đặc; màu nền: #00cc00; lề phải: 6px; căn chỉnh dọc: giữa;" title="Đèn xanh (kích hoạt có điều kiện)"></span>';
      const typeTag = e.type === 'hằng số' ? blueIcon : greenIcon;
      const displayName = escapeHtml(e.comment || `UID:${e.uid}`);
      html += `
                  <div class="wb-sync-checkbox-item" title="${displayName}">
                      <input type="checkbox" id="${id}" value="${e.uid}">
                      <label for="${id}">${typeTag}${displayName}</label>
                  </div>
              `;
    });
    $transEntriesContainer.html(html);
  } bắt (e) {
    $transSelectAllBtn.hide();
    $transEntriesContainer.html('<p style="color:red;">Tải không thành công</p>');
  }
}

xuất hàm không đồng bộ renderCopySourceEntries() {
  const src = $copySourceSelect.val();

  $copyTargetSelect.find('option').prop('disabled', false);
  nếu (src) {
      $copyTargetSelect.find(`option[value="${escapeHtml(src)}"]`.prop('disabled', true);
      if ($copyTargetSelect.val() === src) $copyTargetSelect.val('');
  } }

  nếu ( ! src ) {
      $ sao chépSelectAllBtn. trốn ( ) ;
      return $copyEntriesContainer.html('<p class="wb-sync-no-tasks">CopyEntriesContainer.html('</p>');
  } }
  $copyEntriesContainer.html('<p>CopyEntriesContainer...</p>');
  thử {
    const mục = đang chờ getLorebookEntries ( src ) ;
    $copyEntriesContainer.data('entries',entry).empty();
    if ( mục . chiều dài === 0 ) { .
        $ sao chépSelectAllBtn. ẩn ( ) ;
        trả về $ copyEntriesContainer.
    } }
    $ sao chépSelectAllBtn. hiển thị ( ) ;
    hãy để html = '';
    mục . forEach ( e => { .
      hằng số id = `copy-entry-${e.uid}`;
      const blueIcon = '<span style="display: khối nội tuyến; chiều rộng: 10px; chiều cao: 10px; bán kính đường viền: 50%; đường viền: 2px màu đen đặc; màu nền: #0078d7; lề phải: 6px; căn chỉnh dọc: giữa;" title="Ánh sáng xanh (vĩnh viễn)"></span>';
      const greenIcon = '<span style="display: khối nội tuyến; chiều rộng: 10px; chiều cao: 10px; bán kính đường viền: 50%; đường viền: 2px màu đen đặc; màu nền: #00cc00; lề phải: 6px; căn chỉnh dọc: giữa;" title="Đèn xanh (kích hoạt có điều kiện)"></span>';
      const typeTag = e.type === 'hằng số' ? blueIcon : greenIcon;
      const displayName = escapeHtml(e.comment || `UID:${e.uid}`);
      html += `
                  <div class="wb-sync-checkbox-item" title="${displayName}">
                      <input type="checkbox" id="${id}" value="${e.uid}">
                      <label for="${id}">${typeTag}${displayName}</label>
                  </div>
              `;
    });
    $copyEntriesContainer.html(html);
  } bắt (e) {
    $copySelectAllBtn.hide();
    $copyEntriesContainer.html('<p style="color:red;">Tải không thành công</p>');
  }
}

xuất hàm không đồng bộ handTransferEntries() {
  const src = $transSourceSelect.val(),
    tgt = $transTargetSelect.val();
  const uids = $transEntriesContainer
    .find('input:checked')
    .map((_, el) => $(el).val())
    .get();
  if (!src || !tgt) return toastr.warning('Vui lòng chọn nguồn và đích');
  if (src === tgt) return toastr.warning('Nguồn và đích không thể giống nhau');
  if (uids.length === 0) return toastr.warning('Vui lòng chọn một mục');

  showLoader();
  $transBtn.prop('disabled', true).text('Di chuyển...');
  thử {
    const all = $transEntriesContainer.data('entries') || [];
    const toTrans = all.filter(e => uids.includes(String(e.uid)));

    const newEntries = toTrans.map(e => {
      const newE = { ...e };
      xóa newE.uid;
      trả lại mớiE;
    });

    const api = đang chờ getTavernHelper();

    đang chờ api.createLorebookEntries(tgt, newEntries);
    đang chờ api.deleteLorebookEntries(src, uids.map(uid => ParseInt(uid)));

    toastr.success(`Đã di chuyển thành công ${toTrans.length} mặt hàng`);
    $transEntriesContainer.find('input:checked').prop('checked', SAI);
    renderSourceEntries();
  } bắt (e) {
    toastr.error(`Di chuyển không thành công: ${e.message}`);
  } cuối cùng {
    ẩnLoader();
    $transBtn.prop('disabled', false).text('Thực hiện di chuyển');
  }
}

export async function handleCopyEntries() {
  const src = $copySourceSelect.val(),
    tgt = $copyTargetSelect.val();
  const uids = $copyEntriesContainer
    .find('input:checked')
    .map((_, el) => $(el).val())
    .get();
  if (!src || !tgt) return toastr.warning('Vui lòng chọn nguồn và đích');
  if (src === tgt) return toastr.warning('Nguồn và đích không thể giống nhau');
  if (uids.length === 0) return toastr.warning('Vui lòng chọn một mục');

  showLoader();
  $copyBtn.prop('disabled', true).text('Đang sao chép...');
  try {
    const all = $copyEntriesContainer.data('entries') || [];
    const toCopy = all.filter(e => uids.includes(String(e.uid)));

    const newEntries = toCopy.map(e => {
      const newE = { ...e };
      xóa newE.uid;
      trả lại mới;
    });

    const api = đang chờ getTavernHelper();

    đang chờ api.createLorebookEntries(tgt, newEntries);

    toastr.success(`Đã sao chép thành công các mục ${toCopy.length}`);
    $copyEntriesContainer.find('input:checked').prop('checked', SAI);
  } bắt (e) {
    toastr.error(`Sao chép không thành công: ${e.message}`);
  } cuối cùng {
    ẩnLoader();
    $copyBtn.prop('disabled', false).text('thực hiện sao chép');
  }
}
