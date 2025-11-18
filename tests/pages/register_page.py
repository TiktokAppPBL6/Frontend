from selenium.webdriver.common.by import By
from tests.pages.base_page import BasePage
from tests.config import Config

class RegisterPage(BasePage):
    # Locators
    EMAIL_INPUT = (By.NAME, "email")
    USERNAME_INPUT = (By.NAME, "username")
    FULLNAME_INPUT = (By.NAME, "fullName")
    PASSWORD_INPUT = (By.NAME, "password")
    CONFIRM_PASSWORD_INPUT = (By.NAME, "confirmPassword")
    REGISTER_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".text-red-500")  # Fixed: text-red-500 instead of text-red-400
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/auth/register"
    
    def navigate(self):
        """Điều hướng đến trang register"""
        self.driver.get(self.url)
        return self
    
    def register(self, email, username, fullname, password):
        """Thực hiện đăng ký"""
        self.input_text(*self.EMAIL_INPUT, email)
        self.input_text(*self.USERNAME_INPUT, username)
        self.input_text(*self.FULLNAME_INPUT, fullname)
        self.input_text(*self.PASSWORD_INPUT, password)
        self.input_text(*self.CONFIRM_PASSWORD_INPUT, password)
        self.click_element(*self.REGISTER_BUTTON)
        return self
    
    def set_input_value_js(self, by, value_locator, text):
        """Set input value bằng JavaScript để bypass maxLength và trigger validation"""
        element = self.find_element(by, value_locator)
        
        # Focus vào element
        element.click()
        
        # Loại bỏ maxLength attribute và set value
        self.driver.execute_script("""
            const input = arguments[0];
            const value = arguments[1];
            
            // Xóa maxlength attribute để bypass
            input.removeAttribute('maxlength');
            input.removeAttribute('maxLength');
            
            // Set giá trị bằng native setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 
                'value'
            ).set;
            nativeInputValueSetter.call(input, value);
            
            // Trigger input event (React dùng để detect changes)
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            
            // Trigger change event
            const changeEvent = new Event('change', { bubbles: true });
            input.dispatchEvent(changeEvent);
        """, element, text)
        
        # Blur để trigger validation
        self.driver.execute_script("arguments[0].blur();", element)
        
        return self
    
    def is_register_successful(self):
        """Kiểm tra đăng ký thành công (chuyển về /login hoặc /home)"""
        try:
            self.wait_for_url_contains("/home", timeout=3)
            return True
        except:
            try:
                self.wait_for_url_contains("/login", timeout=2)
                return True
            except:
                return False
    
    def is_error_displayed(self):
        """Kiểm tra có lỗi hiển thị không"""
        import time
        time.sleep(0.5)  # Đợi React render
        
        try:
            # Thử nhiều cách tìm error messages
            # Cách 1: Tìm theo class text-red-500
            errors = self.driver.find_elements(By.CSS_SELECTOR, ".text-red-500")
            
            # Cách 2: Tìm theo text chứa từ khóa lỗi
            if not errors:
                errors = self.driver.find_elements(By.XPATH, "//*[contains(@class, 'text-red') or contains(text(), 'không được') or contains(text(), 'phải có')]")
            
            # Cách 3: Tìm các paragraph có màu đỏ
            if not errors:
                errors = self.driver.find_elements(By.CSS_SELECTOR, "p[class*='red']")
            
            if errors:
                for err in errors:
                    try:
                        if err.is_displayed() and err.text.strip():
                            print(f"  → Error found: {err.text}")
                            return True
                    except:
                        continue
                print(f"  → Found {len(errors)} error elements but none visible/with text")
                return False
            else:
                print("  → No error elements found")
                return False
                
        except Exception as e:
            print(f"  → Exception: {e}")
            return False