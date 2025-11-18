from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
import time

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 20)
    
    def find_element(self, by, value, timeout=20):
        """Tìm element với wait"""
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
    
    def click_element(self, by, value, timeout=20):
        """Click element với wait"""
        element = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        element.click()
        return element
    
    def input_text(self, by, value, text, clear_first=True):
        """Nhập text vào input"""
        element = self.find_element(by, value)
        if clear_first:
            element.clear()
        element.send_keys(text)
        return element
    
    def wait_for_url_contains(self, url_part, timeout=20):
        """Đợi URL chứa chuỗi nào đó"""
        return WebDriverWait(self.driver, timeout).until(
            EC.url_contains(url_part)
        )
    
    def is_element_present(self, by, value, timeout=5):
        """Kiểm tra element có tồn tại không"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False
    
    def scroll_to_element(self, element):
        """Scroll đến element"""
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)
    
    def get_current_url(self):
        """Lấy URL hiện tại"""
        return self.driver.current_url

    def take_screenshot(self, name: str):
        """Chụp ảnh màn hình vào thư mục screenshots với tên kèm timestamp"""
        from tests.config import Config
        import os
        import datetime
        # Ensure directories exist
        Config.ensure_directories()
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = name.replace(" ", "_")
        path = os.path.join(Config.SCREENSHOT_DIR, f"{safe_name}_{ts}.png")
        try:
            self.driver.save_screenshot(path)
            print(f"🖼  Saved screenshot: {path}")
        except Exception as e:
            print(f"⚠️  Could not save screenshot '{name}': {e}")