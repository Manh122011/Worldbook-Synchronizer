import os
import glob

replacements = {
    '。': '.',
    'Tàn tật': 'Vô hiệu hóa',
    'AIđầu ra': 'Đầu ra AI',
    'đầu vào của người dùng': 'Đầu vào người dùng',
    'thông tin thế giới': 'Thông tin thế giới',
    'lý luận': 'Lý luận',
    '>ngắn<': '>Rút gọn<',
    'Chỉ hiển thị định dạng': 'Chỉ hiển thị Text (Markdown)',
    'Chỉ định dạng các từ nhắc nhở': 'Chỉ hiển thị trong Prompt',
    '>độ sâu tối thiểu<': '>Độ sâu tối thiểu<',
    '>độ sâu tối đa<': '>Độ sâu tối đa<',
    'không giới hạn': 'Không giới hạn',
    'Tạo tập lệnh trợ giúp quán rượu': 'Tạo Script Trợ lý Tavern',
    'Nội dung kịch bản': 'Nội dung script',
    'Nhận xét tập lệnh, chẳng hạn như tên tác giả, phiên bản và ghi chú, v.v., hỗ trợ đánh dấu đơn giản và html': 'Ghi chú cho script (Tên tác giả, phiên bản...). Hỗ trợ Markdown và HTML',
    'thư viện tập lệnh toàn cầu': 'Thư viện Script Toàn cục',
    'thư viện tập lệnh mặc định': 'Thư viện Script Preset',
    'thư viện tập lệnh ký tự': 'Thư viện Script Nhân vật',
    'Đồng bộ hóa mặt trước': 'Đồng bộ hóa Giao diện',
    'thẻ bắt đầu:': 'Thẻ bắt đầu:',
    'thẻ kết thúc:': 'Thẻ kết thúc:',
    'tầng được chỉ định:': 'Lầu (tầng) chỉ định:',
    'giống: 1,5,8': 'VD: 1,5,8',
    'Lấy tin tức mới nhất': 'Trích xuất tin nhắn chat',
    'Trích xuất tin tức mới nhất': 'Trích xuất tin nhắn chat',
    'Từ lịch sử trò chuyện': 'Từ lịch sử chat',
    'từ lịch sử trò chuyện': 'từ lịch sử chat',
    'Đồng bộ hóa tập lệnh': 'Đồng bộ hóa Script',
    'dấu câu Trung Quốc': 'dấu câu',
    'Nhấp vào nút': 'Nhấn vào nút',
    'Bấm vào nút': 'Nhấn vào nút',
    'nút "Trích xuất tin nhắn chat" ở trên để trích xuất': 'nút "Trích xuất tin nhắn chat" để lấy',
    'quán rượu': 'Tavern'
}

files = ['panel.html'] + glob.glob('src/**/*.js', recursive=True) + glob.glob('*.html') + glob.glob('*.js')
files = list(set(files))

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original_content = content
        for k, v in replacements.items():
            content = content.replace(k, v)
        
        if content != original_content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Fixed {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")

print("Done fixing Vietnamese terms.")
