import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from tests.config import Config
from tests.pages.login_page import LoginPage
from tests.pages.register_page import RegisterPage
import time

class TestAuth:
    @pytest.fixture(scope="function")
    def driver(self):
        """Setup và teardown browser"""
        options = webdriver.ChromeOptions()
        if Config.HEADLESS:
            options.add_argument("--headless")
        options.add_argument("--start-maximized")
        options.add_argument("--disable-blink-features=AutomationControlled")
        # Disable browser popups/notifications and password manager prompts
        prefs = {
            "profile.password_manager_leak_detection": False,
            "profile.password_manager_enabled": False,
            "credentials_enable_service": False,
            "safebrowsing.enabled": False,
            # Block site notification prompts completely
            "profile.default_content_setting_values.notifications": 2,
        }
        try:
            options.add_experimental_option("prefs", prefs)
        except Exception:
            pass
        options.add_argument("--disable-notifications")
        options.add_argument("--no-default-browser-check")
        options.add_argument("--disable-save-password-bubble")
        options.add_argument("--disable-infobars")
        
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        driver.implicitly_wait(Config.IMPLICIT_WAIT)
        
        yield driver
        
        # Cleanup
        driver.quit()
    
    # ========== REGISTER SUCCESS TESTS ==========
    
    def test_R01_register_success(self, driver):
        """R01 - Đăng ký thành công"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email=Config.TEST_EMAIL,
            username=Config.TEST_USERNAME,
            fullname=Config.TEST_FULLNAME,
            password=Config.TEST_PASSWORD
        )
        # Screenshot
        register_page.take_screenshot("R01_register_success")
        
        assert register_page.is_register_successful(), "Đăng ký không thành công"
        print("✅ Test đăng ký thành công")
    
    # ========== REGISTER FAILURE TESTS ==========
    
    def test_R02_email_invalid_format(self, driver):
        """R02 - Email không hợp lệ"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        # Email sai định dạng
        register_page.register(
            email="nguyenanh",  # Không có @ và domain
            username=Config.TEST_USERNAME_1 ,
            fullname=Config.TEST_FULLNAME_1,
            password=Config.TEST_PASSWORD_1
        )
        
        time.sleep(0.3)
        register_page.take_screenshot("R02_email_invalid_format")
        assert not register_page.is_register_successful(), "Không nên đăng ký thành công với email không hợp lệ"
        print("✅ Test đăng ký email không hợp lệ - passed")
    
    def test_R03_email_empty(self, driver):
        """R03 - Email trống"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email="",  # Email trống
            username=Config.TEST_USERNAME_1 ,
            fullname=Config.TEST_FULLNAME_1,
            password=Config.TEST_PASSWORD_1
        )
        
        time.sleep(0.3)
        register_page.take_screenshot("R03_email_empty")
        assert not register_page.is_register_successful(), "Không nên đăng ký thành công với email trống"
        print("✅ Test đăng ký email trống - passed")
    
    def test_R04_email_existing(self, driver):
        """R04 - Email đã tồn tại"""
        # Đăng ký lần 1
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email=Config.TEST_EMAIL_2,
            username=Config.TEST_USERNAME_1,
            fullname=Config.TEST_FULLNAME_1,
            password=Config.TEST_PASSWORD_1
        )
        time.sleep(0.5)       
        
        
        # Kỳ vọng: Không chuyển trang (vẫn ở /register) hoặc hiển thị lỗi
        current_url = register_page.get_current_url()
        is_still_on_register = "/register" in current_url
        has_error = register_page.is_error_displayed()
        register_page.take_screenshot("R04_email_existing")
        
        assert is_still_on_register or has_error, "Phải hiển thị lỗi email đã tồn tại"
        print("✅ Test đăng ký email đã tồn tại - passed")
    
    def test_R05_username_existing(self, driver):
        """R05 - Username đã tồn tại"""
        # Đăng ký lần 1
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email=Config.TEST_EMAIL_1,
            username=Config.TEST_USERNAME_2,
            fullname=Config.TEST_FULLNAME_1,
            password=Config.TEST_PASSWORD_1
        )
        time.sleep(0.5)
        
        # Kỳ vọng: Không chuyển trang hoặc hiển thị lỗi
        current_url = register_page.get_current_url()
        is_still_on_register = "/register" in current_url
        has_error = register_page.is_error_displayed()
        register_page.take_screenshot("R05_username_existing")
        
        assert is_still_on_register or has_error, "Phải hiển thị lỗi username đã tồn tại"
        print("✅ Test đăng ký username đã tồn tại - passed")
    
    def test_R06_username_too_short(self, driver):
        """R06 - Username quá ngắn"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email=Config.TEST_EMAIL_1,
            username="ab",  # Chỉ 2 ký tự - SAI
            fullname=Config.TEST_FULLNAME_1,
            password=Config.TEST_PASSWORD_1
        )
        
        time.sleep(0.3)
        register_page.take_screenshot("R06_username_too_short")
        assert not register_page.is_register_successful(), "Không nên đăng ký thành công với username quá ngắn"
        print("✅ Test đăng ký username quá ngắn - passed")
    def test_R07_username_too_long(self, driver):
        """R07 - Username quá dài (> 50)"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        long_username = "u" * 51  # 51 ký tự - SAI (vượt quá 50)
        
        # Điền tất cả các field bằng cách thông thường
        register_page.input_text(*register_page.EMAIL_INPUT, Config.TEST_EMAIL_1)
        register_page.input_text(*register_page.USERNAME_INPUT, long_username)
        register_page.input_text(*register_page.FULLNAME_INPUT, Config.TEST_FULLNAME_1)
        register_page.input_text(*register_page.PASSWORD_INPUT, Config.TEST_PASSWORD_1)
        register_page.input_text(*register_page.CONFIRM_PASSWORD_INPUT, Config.TEST_PASSWORD_1)
        time.sleep(0.5)  # Đợi validation hiển thị lỗi
        
        # Kiểm tra có lỗi validation hiển thị
        has_error = register_page.is_error_displayed()
        assert has_error, "Phải hiển thị lỗi validation cho username quá dài"
        
        # Take screenshot để kiểm tra
        register_page.take_screenshot("R07_username_too_long")
        print("✅ Test đăng ký username quá dài - passed")
    
    def test_R08_fullname_empty(self, driver):
        """R08 - Fullname trống"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email=Config.TEST_EMAIL_1,
            username=Config.TEST_USERNAME_1,
            fullname="",  # Fullname trống
            password=Config.TEST_PASSWORD_1
        )
        
        time.sleep(0.3)
        register_page.take_screenshot("R08_fullname_empty")
        assert not register_page.is_register_successful(), "Không nên đăng ký thành công với fullname trống"
        print("✅ Test đăng ký fullname trống - passed")

    def test_R09_fullname_too_long(self, driver):
        """R09 - Fullname quá dài (> 100)"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        long_fullname = "Nguyễn Ngọc Ánh " * 10  # ~220 ký tự - SAI (vượt quá 100)
        
        # Điền tất cả các field bằng cách thông thường
        register_page.input_text(*register_page.EMAIL_INPUT, Config.TEST_EMAIL_1)
        register_page.input_text(*register_page.USERNAME_INPUT, Config.TEST_USERNAME_1)
        register_page.input_text(*register_page.FULLNAME_INPUT, long_fullname)
        register_page.input_text(*register_page.PASSWORD_INPUT, Config.TEST_PASSWORD_1)
        register_page.input_text(*register_page.CONFIRM_PASSWORD_INPUT, Config.TEST_PASSWORD_1)
        time.sleep(0.5)  # Đợi validation hiển thị lỗi
        
        # Kiểm tra có lỗi validation hiển thị
        has_error = register_page.is_error_displayed()
        assert has_error, "Phải hiển thị lỗi validation cho fullname quá dài"
        
        register_page.take_screenshot("R09_fullname_too_long")
        print("✅ Test đăng ký fullname quá dài - passed")
    
    def test_R10_password_too_short(self, driver):
        """R10 - Password quá ngắn"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        register_page.register(
            email=Config.TEST_EMAIL,
            username=Config.TEST_USERNAME,
            fullname=Config.TEST_FULLNAME,
            password="12345"  # Chỉ 5 ký tự - SAI
        )
        
        time.sleep(0.3)
        register_page.take_screenshot("R10_password_too_short")
        assert not register_page.is_register_successful(), "Không nên đăng ký thành công với password quá ngắn"
        print("✅ Test đăng ký password quá ngắn - passed")
    
    def test_R11_password_mismatch(self, driver):
        """R11 - Password không khớp"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        # Nhập confirm password khác
        from selenium.webdriver.common.by import By
        register_page.input_text(*register_page.EMAIL_INPUT, Config.TEST_EMAIL_1)
        register_page.input_text(*register_page.USERNAME_INPUT, Config.TEST_USERNAME_1)
        register_page.input_text(*register_page.FULLNAME_INPUT, Config.TEST_FULLNAME_1)
        register_page.input_text(*register_page.PASSWORD_INPUT, Config.TEST_PASSWORD_1)
        register_page.input_text(*register_page.CONFIRM_PASSWORD_INPUT, "DifferentPassword123")  # SAI - không khớp
        register_page.click_element(*register_page.REGISTER_BUTTON)
        
        time.sleep(0.3)
        register_page.take_screenshot("R11_password_mismatch")
        assert not register_page.is_register_successful(), "Không nên đăng ký thành công với password không khớp"
        print("✅ Test đăng ký password không khớp - passed")    
    
    def test_R12_password_too_long(self, driver):
        """R12 - Password quá dài (> 100)"""
        register_page = RegisterPage(driver)
        register_page.navigate()
        
        long_password = "Pass@123" * 20  # ~160 ký tự - SAI (vượt quá 100)
        
        # Điền tất cả các field bằng cách thông thường
        register_page.input_text(*register_page.EMAIL_INPUT, Config.TEST_EMAIL_1)
        register_page.input_text(*register_page.USERNAME_INPUT, Config.TEST_USERNAME_1)
        register_page.input_text(*register_page.FULLNAME_INPUT, Config.TEST_FULLNAME_1)
        register_page.input_text(*register_page.PASSWORD_INPUT, long_password)
        register_page.input_text(*register_page.CONFIRM_PASSWORD_INPUT, long_password)
        time.sleep(0.5)  # Đợi validation hiển thị lỗi
        
        # Kiểm tra có lỗi validation hiển thị
        has_error = register_page.is_error_displayed()
        assert has_error, "Phải hiển thị lỗi validation cho password quá dài"
        
        register_page.take_screenshot("R12_password_too_long")
        print("✅ Test đăng ký password quá dài - passed")        
    
    # ========== LOGIN SUCCESS TESTS ==========
    
    def test_L01_login_success(self, driver):
        """L01 - Đăng nhập thành công"""
        # Sử dụng tài khoản đã đăng ký trước đó (không register nữa)
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email=Config.TEST_EMAIL_2,
            password=Config.TEST_PASSWORD_2
        )
        login_page.take_screenshot("L01_login_success")
        
        assert login_page.is_login_successful(), "Đăng nhập không thành công"
        print("✅ Test đăng nhập thành công")
    
    # ========== LOGIN FAILURE TESTS ==========
    
    def test_L02_login_wrong_password(self, driver):
        """L02 - Đăng nhập sai mật khẩu"""
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email=Config.TEST_EMAIL_2,
            password="wrong_password"
        )
        
        time.sleep(0.3)
        login_page.take_screenshot("L02_login_wrong_password")
        assert not login_page.is_login_successful(), "Không nên đăng nhập thành công với mật khẩu sai"
        print("✅ Test đăng nhập sai mật khẩu - passed")
    
    def test_L03_login_wrong_email(self, driver):
        """L03 - Đăng nhập email không tồn tại"""
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email=Config.TEST_EMAIL_1,
            password=Config.TEST_PASSWORD_1
        )
        
        time.sleep(0.3)
        login_page.take_screenshot("L03_login_wrong_email")
        assert not login_page.is_login_successful(), "Không nên đăng nhập thành công với email không tồn tại"
        print("✅ Test đăng nhập email không tồn tại - passed")
    
    def test_L04_login_empty_email(self, driver):
        """L04 - Đăng nhập email trống"""
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email="",
            password=Config.TEST_PASSWORD_2
        )
        
        time.sleep(0.3)
        login_page.take_screenshot("L04_login_empty_email")
        assert not login_page.is_login_successful(), "Không nên đăng nhập thành công với email trống"
        print("✅ Test đăng nhập email trống - passed")
    
    def test_L05_login_empty_password(self, driver):
        """L05 - Đăng nhập password trống"""
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email=Config.TEST_EMAIL_2,
            password=""
        )
        
        time.sleep(0.3)
        login_page.take_screenshot("L05_login_empty_password")
        assert not login_page.is_login_successful(), "Không nên đăng nhập thành công với password trống"
        print("✅ Test đăng nhập password trống - passed")
    
    def test_L06_login_both_empty(self, driver):
        """L06 - Đăng nhập cả email và password trống"""
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email="",
            password=""
        )
        
        time.sleep(0.3)
        login_page.take_screenshot("L06_login_both_empty")
        assert not login_page.is_login_successful(), "Không nên đăng nhập thành công với cả hai trống"
        print("✅ Test đăng nhập cả hai trống - passed")
    
    def test_L07_login_invalid_email_format(self, driver):
        """L07 - Đăng nhập email sai định dạng"""
        login_page = LoginPage(driver)
        login_page.navigate()
        
        login_page.login(
            email="nguyenanh",
            password=Config.TEST_PASSWORD
        )
        
        time.sleep(0.3)
        login_page.take_screenshot("L07_login_invalid_email_format")
        assert not login_page.is_login_successful(), "Không nên đăng nhập thành công với email sai định dạng"
        print("✅ Test đăng nhập email sai định dạng - passed")
    
    
    