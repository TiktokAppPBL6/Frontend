from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.pages.base_page import BasePage
from tests.config import Config
import time

class UploadPage(BasePage):
    # Locators - Updated to match current UI
    FILE_INPUT = (By.CSS_SELECTOR, "input[type='file']")
    CHOOSE_VIDEO_BTN = (By.CSS_SELECTOR, "button:has-text('Chọn video')")
    TITLE_INPUT = (By.CSS_SELECTOR, "input[placeholder='Nhập tiêu đề video...']")
    DESCRIPTION_TEXTAREA = (By.CSS_SELECTOR, "textarea[placeholder='Mô tả video của bạn...']")
    VISIBILITY_SELECT = (By.CSS_SELECTOR, "select")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".text-red-500")
    WARNING_MESSAGE = (By.CSS_SELECTOR, ".text-yellow-500")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/upload"
    
    def navigate(self):
        """Điều hướng đến trang upload"""
        self.driver.get(self.url)
        time.sleep(1)
        return self
    
    def upload_video_quick(self, video_path, title, description="", visibility="public"):
        """
        Upload video nhanh (không delay)
        Args:
            video_path: Đường dẫn file video
            title: Tiêu đề video
            description: Mô tả video (optional)
            visibility: "public" hoặc "hidden"
        """
        # Upload file
        file_input = self.find_element(*self.FILE_INPUT)
        file_input.send_keys(video_path)
        time.sleep(1.5)
        
        # Fill title
        title_input = self.find_element(*self.TITLE_INPUT)
        title_input.clear()
        title_input.send_keys(title)
        
        # Fill description if provided
        if description:
            desc_textarea = self.find_element(*self.DESCRIPTION_TEXTAREA)
            desc_textarea.clear()
            desc_textarea.send_keys(description)
        
        # Set visibility if not public
        if visibility != "public":
            try:
                select = self.find_element(*self.VISIBILITY_SELECT)
                select.click()
                time.sleep(0.2)
                option = self.driver.find_element(By.CSS_SELECTOR, f"option[value='{visibility}']")
                option.click()
                time.sleep(0.2)
            except:
                pass
        
        # Submit
        submit_btn = self.find_element(*self.SUBMIT_BUTTON)
        submit_btn.click()
        
        return self
    
    def set_input_value_js(self, selector, text):
        """
        Set input value bằng JavaScript để bypass maxLength
        Args:
            selector: CSS selector
            text: Text to set
        """
        element = self.driver.find_element(By.CSS_SELECTOR, selector)
        
        self.driver.execute_script("""
            const input = arguments[0];
            const value = arguments[1];
            
            // Remove maxLength
            input.removeAttribute('maxlength');
            input.removeAttribute('maxLength');
            
            // Set value using native setter
            const descriptor = Object.getOwnPropertyDescriptor(
                input instanceof HTMLTextAreaElement 
                    ? window.HTMLTextAreaElement.prototype 
                    : window.HTMLInputElement.prototype, 
                'value'
            );
            descriptor.set.call(input, value);
            
            // Trigger React events
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.blur();
        """, element, text)
        
        time.sleep(0.3)
        return self
    
    def wait_for_profile_redirect(self, timeout=20):
        """Đợi redirect về trang profile sau khi upload"""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda d: "/user/" in d.current_url
            )
            time.sleep(1)
            return True
        except:
            return False
    
    def is_upload_successful(self):
        """Kiểm tra upload thành công bằng cách check URL"""
        try:
            WebDriverWait(self.driver, 20).until(
                lambda d: "/user/" in d.current_url or "/home" in d.current_url
            )
            return True
        except:
            return False
    
    def is_error_displayed(self):
        """Kiểm tra có lỗi hiển thị không"""
        return self.is_element_present(*self.ERROR_MESSAGE)
    
    def is_warning_displayed(self):
        """Kiểm tra có cảnh báo hiển thị không"""
        return self.is_element_present(*self.WARNING_MESSAGE) or self.is_element_present(*self.ERROR_MESSAGE)
    
    def is_submit_disabled(self):
        """Kiểm tra nút submit có bị disable không"""
        try:
            submit_btn = self.find_element(*self.SUBMIT_BUTTON)
            return not submit_btn.is_enabled() or "disabled" in submit_btn.get_attribute("class")
        except:
            return True