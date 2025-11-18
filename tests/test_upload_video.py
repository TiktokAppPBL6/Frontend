import pytest
import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.pages.login_page import LoginPage
from tests.config import Config

def take_screenshot(driver, test_name):
    """Chụp screenshot và lưu vào thư mục screenshots"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{test_name}_{timestamp}.png"
    filepath = os.path.join(Config.SCREENSHOT_DIR, filename)
    driver.save_screenshot(filepath)
    print(f"Screenshot saved: {filepath}")

@pytest.fixture(scope="function")
def driver():
    """Setup browser - Tối ưu tốc độ"""
    options = webdriver.ChromeOptions()
    if Config.HEADLESS:
        options.add_argument("--headless")
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    
    prefs = {
        "profile.password_manager_leak_detection": False,
        "profile.password_manager_enabled": False,
        "credentials_enable_service": False,
        "profile.default_content_setting_values.notifications": 2,
    }
    options.add_experimental_option("prefs", prefs)
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

@pytest.fixture
def logged_in_driver(driver):
    """Login nhanh"""
    login_page = LoginPage(driver)
    login_page.navigate()
    login_page.login(Config.TEST_EMAIL_2, Config.TEST_PASSWORD_2)
    time.sleep(2)
    yield driver

def verify_video_on_profile(driver, video_title, timeout=10):
    """Verify video đăng thành công - check URL video detail"""
    try:
        # Đợi chuyển sang trang video detail
        WebDriverWait(driver, timeout).until(lambda d: "/video/" in d.current_url)
        time.sleep(1)
        
        # Scroll xuống một chút để nhìn rõ video
        driver.execute_script("window.scrollBy(0, 320);")
        time.sleep(0.5)
        
        # Kiểm tra title xuất hiện trong trang
        return video_title.lower() in driver.page_source.lower()
    except:
        return False

# ========== SUCCESS CASES ==========

def test_UV01_upload_full_data(logged_in_driver):
    """UV01 - Upload đầy đủ dữ liệu"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_title = f"{Config.TEST_VIDEO_TITLE} UV01"
    video_description = f"{Config.TEST_VIDEO_DESCRIPTION} UV01"
    
    # Upload file
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_VIDEO_PATH)
    time.sleep(1.5)
    
    # Fill data
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']").send_keys(video_description)
    
    # Submit
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    
    result = verify_video_on_profile(driver, video_title, 15)
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV01_upload_full_data")
    
    assert result, f"Video không xuất hiện"

def test_UV02_upload_empty_description(logged_in_driver):
    """UV02 - Description trống"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_title = f"{Config.TEST_VIDEO_TITLE} UV02"
    
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_VIDEO_PATH)
    time.sleep(1.5)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    
    result = verify_video_on_profile(driver, video_title, 15)
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV02_upload_empty_description")
    
    assert result

def test_UV03_upload_private_mode(logged_in_driver):
    """UV03 - Upload Riêng tư"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_title = f"{Config.TEST_VIDEO_TITLE} UV03"
    video_description = f"{Config.TEST_VIDEO_DESCRIPTION} UV03"
    
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_VIDEO_PATH)
    time.sleep(1.5)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']").send_keys(video_description)
    
    # Select Private
    try:
        select = driver.find_element(By.CSS_SELECTOR, "select")
        select.click()
        time.sleep(0.2)
        driver.find_element(By.CSS_SELECTOR, "option[value='hidden']").click()
        time.sleep(0.2)
    except:
        pass
    
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    result = verify_video_on_profile(driver, video_title, 15)
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV03_upload_private_mode")
    
    assert result

# ========== TITLE VALIDATION ==========

def test_UV04_title_empty(logged_in_driver):
    """UV04 - Title trống"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_description = f"{Config.TEST_VIDEO_DESCRIPTION} UV04"
    
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_VIDEO_PATH)
    time.sleep(1.5)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']").send_keys(video_description)
    
    submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    is_disabled = not submit.is_enabled() or "disabled" in submit.get_attribute("class")
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV04_title_empty")
    
    assert is_disabled, "Phải chặn upload khi Title trống"

def test_UV05_title_too_long(logged_in_driver):
    """UV05 - Title > 150 ký tự"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_VIDEO_PATH)
    time.sleep(1.5)
    
    # Scroll xuống để nhìn thấy form
    driver.execute_script("window.scrollBy(0, 200);")
    time.sleep(0.3)
    
    # JS bypass maxLength và trigger React
    title_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']")
    driver.execute_script("""
        const input = arguments[0];
        const value = arguments[1];
        
        // Set value using native setter to trigger React
        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 
            'value'
        ).set;
        nativeSetter.call(input, value);
        
        // Trigger React events
        input.dispatchEvent(new Event('input', {bubbles: true}));
        input.dispatchEvent(new Event('change', {bubbles: true}));
        input.blur();
    """, title_input, "A" * 160)
    
    time.sleep(1)
    
    # Check warning
    has_warning = False
    try:
        page_source = driver.page_source
        # Check for counter with red text
        if "160/150" in page_source:
            # Find all spans and check for red color
            spans = driver.find_elements(By.TAG_NAME, "span")
            for span in spans:
                if "160/150" in span.text and "text-red-500" in span.get_attribute("class"):
                    has_warning = True
                    break
        
        # Or check for warning message
        if not has_warning and "Vượt quá giới hạn" in page_source:
            has_warning = True
    except Exception as e:
        print(f"Error checking warning: {e}")
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV05_title_too_long")
    
    assert has_warning, "Phải có cảnh báo khi Title > 150"

# ========== DESCRIPTION VALIDATION ==========

def test_UV06_description_too_long(logged_in_driver):
    """UV06 - Description > 500 ký tự"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_title = f"{Config.TEST_VIDEO_TITLE} UV06"
    
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_VIDEO_PATH)
    time.sleep(1.5)
    
    # Scroll xuống để nhìn thấy form
    driver.execute_script("window.scrollBy(0, 200);")
    time.sleep(0.3)
    
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
    
    # JS bypass maxLength và trigger React
    desc = driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']")
    driver.execute_script("""
        const textarea = arguments[0];
        const value = arguments[1];
        
        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 
            'value'
        ).set;
        nativeSetter.call(textarea, value);
        
        textarea.dispatchEvent(new Event('input', {bubbles: true}));
        textarea.dispatchEvent(new Event('change', {bubbles: true}));
        textarea.blur();
    """, desc, "B" * 520)
    
    time.sleep(1)
    
    has_warning = False
    try:
        page_source = driver.page_source
        # Check for counter with red text
        if "520/500" in page_source:
            spans = driver.find_elements(By.TAG_NAME, "span")
            for span in spans:
                if "520/500" in span.text and "text-red-500" in span.get_attribute("class"):
                    has_warning = True
                    break
        
        # Or check for warning message
        if not has_warning and "Vượt quá giới hạn" in page_source:
            has_warning = True
    except Exception as e:
        print(f"Error checking warning: {e}")
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV06_description_too_long")
    
    assert has_warning, "Phải có cảnh báo khi Description > 500"

# ========== FILE VALIDATION ==========

def test_UV07_no_file(logged_in_driver):
    """UV07 - Không có file"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_title = f"{Config.TEST_VIDEO_TITLE} UV07"
    video_description = f"{Config.TEST_VIDEO_DESCRIPTION} UV07"
    
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']").send_keys(video_description)
    
    submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    is_disabled = not submit.is_enabled() or "disabled" in submit.get_attribute("class")
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV07_no_file")
    
    assert is_disabled, "Phải chặn upload khi không có file"

def test_UV08_invalid_file_format(logged_in_driver):
    """UV08 - File không hợp lệ (.txt)"""
    driver = logged_in_driver
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    # Create temp .txt
    video_title = f"{Config.TEST_VIDEO_TITLE} UV08"
    video_description= f"{Config.TEST_VIDEO_DESCRIPTION} UV08"
    txt_path = os.path.join(Config.TEST_DATA_DIR, "invalid.txt")
    with open(txt_path, "w") as f:
        f.write("Not a video")
    
    try:
        driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(txt_path)
        driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
        driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']").send_keys(video_description)
        time.sleep(1.5)
        
        has_error = False
        try:
            errors = driver.find_elements(By.CSS_SELECTOR, ".text-red-500, [class*='error']")
            for e in errors:
                if "định dạng" in e.text.lower() or "format" in e.text.lower() or "video" in e.text.lower():
                    has_error = True
                    break
        except:
            pass
        
        if not has_error:
            submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            has_error = not submit.is_enabled() or "disabled" in submit.get_attribute("class")
        
        # Dừng lại 1.5s và chụp screenshot
        time.sleep(1.5)
        take_screenshot(driver, "UV08_invalid_file_format")
        
        assert has_error, "Phải báo lỗi file không hợp lệ"
    finally:
        if os.path.exists(txt_path):
            os.remove(txt_path)

def test_UV09_video_too_long(logged_in_driver):
    """UV09 - Video > 120s"""
    driver = logged_in_driver
    
    if not os.path.exists(Config.TEST_LONG_VIDEO_PATH):
        pytest.skip(f"Long video not found: {Config.TEST_LONG_VIDEO_PATH}")
    
    driver.get(f"{Config.BASE_URL}/upload")
    time.sleep(1)
    
    video_title = f"{Config.TEST_VIDEO_TITLE} UV09"
    video_description= f"{Config.TEST_VIDEO_DESCRIPTION} UV09"
    
    driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(Config.TEST_LONG_VIDEO_PATH)
    time.sleep(2)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']").send_keys(video_title)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']").send_keys(video_description)
    
    time.sleep(1)
    
    has_error = False
    try:
        errors = driver.find_elements(By.CSS_SELECTOR, ".text-red-500, [class*='error']")
        for e in errors:
            if "thời lượng" in e.text.lower() or "duration" in e.text.lower() or "120" in e.text or "quá dài" in e.text.lower():
                has_error = True
                break
    except:
        pass
    
    if not has_error:
        submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        has_error = not submit.is_enabled() or "disabled" in submit.get_attribute("class")
    
    # Dừng lại 1.5s và chụp screenshot
    time.sleep(1.5)
    take_screenshot(driver, "UV09_video_too_long")
    
    assert has_error, "Phải báo lỗi video quá dài"
