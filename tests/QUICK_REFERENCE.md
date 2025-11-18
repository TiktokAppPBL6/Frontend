# 🚀 Quick Reference - Test Interactions

## One-Line Commands

```powershell
# Chạy tất cả (thời gian: ~50s)
pytest tests/test_interactions.py -v -s

# Chạy với report HTML
pytest tests/test_interactions.py --html=tests/reports/interactions.html --self-contained-html

# Chạy 1 test cụ thể
pytest tests/test_interactions.py::TestVideoInteractions::test_I03_like_video -v -s

# Chạy theo từ khóa
pytest tests/test_interactions.py -k "follow" -v -s
pytest tests/test_interactions.py -k "like" -v -s
pytest tests/test_interactions.py -k "comment" -v -s
```

---

## Test IDs Quick Access

```powershell
# I01-I02: Follow/Unfollow
pytest tests/test_interactions.py::TestVideoInteractions::test_I01_follow_user -v -s
pytest tests/test_interactions.py::TestVideoInteractions::test_I02_unfollow_user -v -s

# I03-I04: Like/Unlike
pytest tests/test_interactions.py::TestVideoInteractions::test_I03_like_video -v -s
pytest tests/test_interactions.py::TestVideoInteractions::test_I04_unlike_video -v -s

# I05-I07: Comments
pytest tests/test_interactions.py::TestVideoInteractions::test_I05_comment_valid -v -s
pytest tests/test_interactions.py::TestVideoInteractions::test_I06_comment_empty -v -s
pytest tests/test_interactions.py::TestVideoInteractions::test_I07_comment_too_long -v -s

# I08: Share
pytest tests/test_interactions.py::TestVideoInteractions::test_I08_share_link -v -s

# I09-I10: Bookmark
pytest tests/test_interactions.py::TestVideoInteractions::test_I09_bookmark_video -v -s
pytest tests/test_interactions.py::TestVideoInteractions::test_I10_unbookmark_video -v -s
```

---

## Essential Files

| File | Purpose |
|------|---------|
| `test_interactions.py` | Main test file (10 test cases) |
| `pages/video_page.py` | Page object with interaction methods |
| `pages/login_page.py` | Login functionality |
| `config.py` | Configuration & credentials |

---

## Quick Debug

```powershell
# Chạy với debug output chi tiết
pytest tests/test_interactions.py -v -s --tb=short

# Chạy với breakpoint (thêm breakpoint() vào code)
pytest tests/test_interactions.py -v -s --pdb

# Xem list tests không chạy
pytest tests/test_interactions.py --collect-only
```

---

## Environment Check

```powershell
# Check Python version
python --version  # Should be 3.8+

# Check pytest installed
pytest --version

# Check Selenium
pip show selenium

# Check webdriver-manager
pip show webdriver-manager
```

---

## Troubleshooting

### ❌ "Login unsuccessful"
```powershell
# Kiểm tra credentials trong config.py
# Đảm bảo tài khoản anhnn1201@gmail.com tồn tại
```

### ❌ "Element not found"
```powershell
# Tăng timeout trong config.py
EXPLICIT_WAIT = 30  # Thay vì 20
```

### ❌ "Chrome not found"
```powershell
# Cài Chrome browser hoặc sử dụng Firefox
# Thay đổi trong test file: webdriver.Firefox()
```

---

## Credentials

```python
# Default test user (trong config.py)
Email: anhnn1201@gmail.com
Password: 123456
```

---

## File Structure

```
tests/
├── test_interactions.py        ← Main test file
├── config.py                   ← Configuration
├── pages/
│   ├── base_page.py           ← Base methods
│   ├── login_page.py          ← Login page object
│   └── video_page.py          ← Video interaction methods
├── screenshots/                ← Auto screenshots
└── reports/                    ← HTML reports
```

---

## Test Statistics

- **Total Tests**: 10
- **Test Groups**: 5 (Follow, Like, Comment, Share, Bookmark)
- **Avg Time/Test**: ~5 seconds
- **Total Runtime**: ~50 seconds
- **Auto Screenshots**: ✅ Yes (10 files)
- **HTML Report**: ✅ Optional

---

## Important Selectors (video_page.py)

```python
# Buttons
LIKE_BUTTON = "button[aria-label*='Like']"
COMMENT_BUTTON = "button[aria-label*='Comment']"
BOOKMARK_BUTTON = "button[aria-label*='Bookmark']"
SHARE_BUTTON = "button[aria-label*='Share']"

# Input
COMMENT_INPUT = "input[placeholder*='bình luận']"
COMMENT_SUBMIT = "button[type='submit']"

# States
LIKED_ICON = "svg.fill-[\\#FE2C55]"  # Pink heart
```

---

## Cheat Sheet

| Action | Method | Return |
|--------|--------|--------|
| Follow user | `click_follow()` | `bool` |
| Unfollow user | `click_unfollow()` | `bool` |
| Like video | `click_like()` | `bool` |
| Check liked | `is_video_liked()` | `bool` |
| Add comment | `add_comment(text)` | `bool` |
| Share video | `click_share()` | `bool` |
| Bookmark | `click_bookmark()` | `bool` |
| Navigate home | `navigate_to_home()` | `self` |

---

## Pytest Flags

```powershell
-v          # Verbose output
-s          # Show print statements
-k "name"   # Run tests matching name
--tb=short  # Short traceback
--html=file # Generate HTML report
--collect-only  # List tests without running
```

---

## Expected Results

```
✅ 10 passed in ~50s
📸 10 screenshots saved
📊 HTML report generated (optional)
```

---

**Quick Start**: `pytest tests/test_interactions.py -v -s`  
**With Report**: `pytest tests/test_interactions.py --html=tests/reports/report.html --self-contained-html`

---

📚 **Full Documentation**: See `TEST_INTERACTIONS_README.md`  
📊 **Flow Diagram**: See `TEST_FLOW_DIAGRAM.md`  
📝 **Summary**: See `SUMMARY_INTERACTIONS.md`
