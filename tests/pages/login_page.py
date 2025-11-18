from selenium.webdriver.common.by import By
from tests.pages.base_page import BasePage
from tests.config import Config

class LoginPage(BasePage):
    # Locators
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    LOGIN_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".text-red-400")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/auth/login"
    
    def navigate(self):
        """Điều hướng đến trang login"""
        self.driver.get(self.url)
        return self
    
    def login(self, email, password):
        """Thực hiện đăng nhập"""
        self.input_text(*self.EMAIL_INPUT, email)
        self.input_text(*self.PASSWORD_INPUT, password)
        self.click_element(*self.LOGIN_BUTTON)
        return self
    
    def is_error_displayed(self):
        """Kiểm tra có lỗi hiển thị không"""
        return self.is_element_present(*self.ERROR_MESSAGE)
    
    def is_login_successful(self):
        """Kiểm tra đăng nhập thành công (chuyển về /home)"""
        try:
            self.wait_for_url_contains("/home", timeout=3)
            return True
        except:
            return False