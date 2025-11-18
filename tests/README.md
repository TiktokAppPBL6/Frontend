# Selenium Automated Testing - TikTok Clone

## 📋 Tổng quan

Hệ thống test tự động đầy đủ cho ứng dụng TikTok Clone sử dụng Selenium WebDriver và Pytest.

## 🎯 Các chức năng được test

### 1. **Authentication (Đăng ký & Đăng nhập)**
- ✅ Đăng ký thành công với dữ liệu hợp lệ
- ✅ Đăng ký với email không hợp lệ (sai format, trống, quá dài, đã tồn tại)
- ✅ Đăng ký với username không hợp lệ (trống, quá ngắn, quá dài)
- ✅ Đăng ký với password không hợp lệ (trống, quá ngắn, không khớp)
- ✅ Đăng ký với fullname không hợp lệ (trống, quá dài)
- ✅ Đăng nhập thành công
- ✅ Đăng nhập thất bại (sai password, email không tồn tại, dữ liệu trống)

**File test:** `tests/test_auth.py` (20 test cases)

### 2. **Video Upload (Đăng video)**
- ✅ Upload video thành công với dữ liệu hợp lệ
- ✅ Upload với title trống, quá dài
- ✅ Upload với description trống, quá dài
- ✅ Upload không chọn file
- ✅ Upload file không đúng định dạng
- ✅ Upload file quá lớn (> 100MB)
- ✅ Upload video quá dài (> 10 phút)
- ✅ Upload với ký tự đặc biệt, Unicode, emoji

**File test:** `tests/test_upload_comprehensive.py` (11 test cases)

### 3. **Social Interactions (Tương tác xã hội)**
- ✅ Like video thành công
- ✅ Unlike video (bỏ like)
- ✅ Click like nhiều lần
- ✅ Thêm comment thành công
- ✅ Comment trống, quá dài
- ✅ Comment với ký tự đặc biệt, tiếng Việt, emoji
- ✅ Thêm nhiều comment liên tiếp
- ✅ Bookmark video
- ✅ Unbookmark video
- ✅ Tất cả tương tác trên cùng video
- ✅ Tương tác khi chưa đăng nhập

**File test:** `tests/test_interactions_comprehensive.py` (15 test cases)

## 📁 Cấu trúc thư mục

```
tests/
├── __init__.py
├── config.py                           # Cấu hình chung
├── run_tests.py                        # Script chạy tests
├── test_auth.py                        # Tests authentication
├── test_upload_comprehensive.py        # Tests upload video
├── test_interactions_comprehensive.py  # Tests social interactions
├── pages/                              # Page Object Model
│   ├── __init__.py
│   ├── base_page.py                   # Base class
│   ├── login_page.py                  # Login page
│   ├── register_page.py               # Register page
│   ├── upload_page.py                 # Upload page
│   └── video_page.py                  # Video page
├── test_data/                          # Test data
│   ├── test_video.mp4                 # Video nhỏ (~1-5MB)
│   ├── large_video.mp4                # Video lớn (> 100MB)
│   └── long_video.mp4                 # Video dài (> 10 phút)
├── screenshots/                        # Screenshots khi test fail
└── reports/                            # Báo cáo HTML
```

## 🚀 Cài đặt

### Bước 1: Cài đặt Python packages

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Cài đặt packages
pip install selenium
pip install webdriver-manager
pip install pytest
pip install pytest-html
```

### Bước 2: Chuẩn bị test data

Đặt các file video test vào thư mục `tests/test_data/`:
- `test_video.mp4`: Video nhỏ (1-5MB, < 1 phút) - **BẮT BUỘC**
- `large_video.mp4`: Video lớn (> 100MB) - Tùy chọn
- `long_video.mp4`: Video dài (> 10 phút) - Tùy chọn

### Bước 3: Đảm bảo ứng dụng đang chạy

```bash
# Frontend
npm run dev  # http://localhost:3000

# Backend API
# Đảm bảo backend đang chạy trên http://localhost:8000
```

## 🎮 Cách chạy tests

### Chạy TẤT CẢ tests

```bash
# Cách 1: Dùng run_tests.py
python tests/run_tests.py

# Cách 2: Dùng pytest trực tiếp
pytest tests/ -v --html=tests/reports/report.html --self-contained-html
```

### Chạy từng test suite

```bash
# Chỉ test Authentication
python tests/run_tests.py auth
# Hoặc:
pytest tests/test_auth.py -v

# Chỉ test Upload
python tests/run_tests.py upload
# Hoặc:
pytest tests/test_upload_comprehensive.py -v

# Chỉ test Interactions
python tests/run_tests.py interactions
# Hoặc:
pytest tests/test_interactions_comprehensive.py -v
```

### Chạy test cụ thể

```bash
# Chạy 1 test case cụ thể
pytest tests/test_auth.py::TestAuthentication::test_01_register_with_valid_data -v

# Chạy các test có từ khóa
pytest tests/ -k "login" -v
pytest tests/ -k "comment" -v
```

### Chạy ở chế độ Headless (không hiển thị browser)

```python
# Sửa trong tests/config.py
HEADLESS = True
```

## 📊 Xem báo cáo

Sau khi chạy tests, báo cáo HTML sẽ được tạo trong thư mục `tests/reports/`:

```bash
# Mở báo cáo bằng browser
start tests/reports/test_report_YYYYMMDD_HHMMSS.html  # Windows
open tests/reports/test_report_YYYYMMDD_HHMMSS.html   # Mac
xdg-open tests/reports/test_report_YYYYMMDD_HHMMSS.html  # Linux
```

Báo cáo bao gồm:
- Tổng số tests pass/fail
- Thời gian chạy mỗi test
- Chi tiết lỗi nếu có
- Screenshots khi test fail

## 🛠️ Tùy chỉnh cấu hình

Sửa file `tests/config.py`:

```python
class Config:
    # URLs
    BASE_URL = "http://localhost:3000"  # URL ứng dụng
    
    # Timeouts
    IMPLICIT_WAIT = 10  # Giây
    EXPLICIT_WAIT = 20  # Giây
    
    # Browser
    BROWSER = "chrome"  # chrome, firefox, edge
    HEADLESS = False    # True: không hiển thị browser
    
    # Test data
    TEST_VIDEO_PATH = "path/to/your/video.mp4"
```

## 📸 Screenshots

Screenshots tự động được chụp khi:
- Test fail
- Các điểm quan trọng trong test (success, error)

Lưu tại: `tests/screenshots/`

## ⚙️ Cấu trúc Page Object Model

Các page class trong `tests/pages/`:

**BasePage**: Các method chung
- `find_element()`: Tìm element
- `click_element()`: Click element
- `input_text()`: Nhập text
- `is_element_present()`: Kiểm tra element tồn tại
- `take_screenshot()`: Chụp màn hình
- `scroll_to_element()`: Scroll đến element

**LoginPage**: Trang đăng nhập
- `navigate()`: Điều hướng đến trang
- `login(email, password)`: Thực hiện đăng nhập
- `is_login_successful()`: Kiểm tra đăng nhập thành công

**RegisterPage**: Trang đăng ký
- `navigate()`: Điều hướng đến trang
- `register(email, username, fullname, password)`: Đăng ký
- `is_register_successful()`: Kiểm tra đăng ký thành công

**UploadPage**: Trang upload video
- `navigate()`: Điều hướng đến trang
- `upload_video(video_path, title, description)`: Upload video
- `is_upload_successful()`: Kiểm tra upload thành công

**VideoPage**: Trang video detail
- `navigate_to_video(video_id)`: Điều hướng đến video
- `click_like()`: Click like
- `add_comment(text)`: Thêm comment
- `click_bookmark()`: Click bookmark

## 🐛 Troubleshooting

### Lỗi: "WebDriver không tìm thấy"
```bash
# Cài đặt lại webdriver-manager
pip install --upgrade webdriver-manager
```

### Lỗi: "Element not found"
- Tăng timeout trong `config.py`
- Kiểm tra selector có đúng không

### Lỗi: "Test video không tồn tại"
- Đảm bảo file `test_video.mp4` có trong `tests/test_data/`
- Kiểm tra đường dẫn trong `config.py`

### Tests chạy chậm
- Giảm `IMPLICIT_WAIT` và `EXPLICIT_WAIT`
- Bật `HEADLESS = True`
- Chạy từng suite thay vì all

## 📈 CI/CD Integration

Để tích hợp vào CI/CD (GitHub Actions, GitLab CI):

```yaml
# .github/workflows/test.yml
name: Selenium Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          python tests/run_tests.py
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: tests/reports/
```

## 📝 Tổng kết

**Tổng số test cases:** 46+
- Authentication: 20 tests
- Upload: 11 tests
- Interactions: 15 tests

**Độ bao phủ:**
- ✅ Happy path (các trường hợp đúng)
- ✅ Boundary testing (giới hạn độ dài)
- ✅ Negative testing (các trường hợp sai)
- ✅ Edge cases (các trường hợp đặc biệt)

**Thời gian chạy:** ~10-15 phút (tất cả tests)

## 🤝 Contribution

Để thêm test mới:
1. Tạo test function trong file test phù hợp
2. Đặt tên theo convention: `test_XX_description`
3. Sử dụng Page Object để tương tác với UI
4. Assert kết quả và chụp screenshot

## 📞 Hỗ trợ

Nếu có vấn đề:
1. Kiểm tra logs trong console
2. Xem screenshots trong `tests/screenshots/`
3. Xem báo cáo HTML chi tiết
4. Kiểm tra app và API đang chạy đúng

---

**Happy Testing! 🚀**
