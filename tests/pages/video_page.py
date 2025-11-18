from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.pages.base_page import BasePage
from tests.config import Config
import time

class VideoPage(BasePage):
    # Locators - Video Actions
    LIKE_BUTTON = (By.CSS_SELECTOR, "button[aria-label*='Like'], button[aria-label*='Thích']")
    COMMENT_BUTTON = (By.CSS_SELECTOR, "button[aria-label*='Comment'], button[aria-label*='Bình luận']")
    BOOKMARK_BUTTON = (By.CSS_SELECTOR, "button[aria-label*='Bookmark'], button[aria-label*='Lưu']")
    SHARE_BUTTON = (By.CSS_SELECTOR, "button[aria-label*='Share'], button[aria-label*='Chia sẻ']")
    
    # Comment
    COMMENT_INPUT = (By.CSS_SELECTOR, "input[placeholder*='bình luận'], input[placeholder*='comment']")
    COMMENT_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    
    # Liked state
    LIKED_ICON = (By.CSS_SELECTOR, "svg.fill-[\\#FE2C55]")
    
    def __init__(self, driver):
        super().__init__(driver)
    
    def navigate_to_video(self, video_id):
        """Điều hướng đến video detail"""
        self.driver.get(f"{Config.BASE_URL}/video/{video_id}")
        time.sleep(2)
        return self
    
    def click_like(self):
        """Click nút like - button đầu tiên trong div.flex.flex-col"""
        try:
            # Scroll và wait để tái tạo DOM hoàn toàn
            self.driver.execute_script("window.scrollTo(0, 100);");
            time.sleep(0.2)
            self.driver.execute_script("window.scrollTo(0, 0);");
            time.sleep(0.5)
            
            # Tìm lại container và button hoàn toàn mới
            containers = self.driver.find_elements(By.CSS_SELECTOR, "div.flex.flex-col.gap-3")
            if not containers:
                return False
            
            action_container = containers[0]
            buttons = action_container.find_elements(By.CSS_SELECTOR, "button")
            if not buttons:
                return False
            
            like_button = buttons[0]
            
            # Click bằng JavaScript để tránh lỗi
            self.driver.execute_script("arguments[0].click();", like_button)
            time.sleep(0.7)
            return True
        except Exception as e:
            print(f"Error clicking like: {e}")
            return False
    
    def is_video_liked(self):
        """Kiểm tra video đã được like chưa"""
        try:
            # Đợi một chút để UI update
            time.sleep(0.3)
            
            # Tìm lại elements mới để tránh stale
            containers = self.driver.find_elements(By.CSS_SELECTOR, "div.flex.flex-col.gap-3")
            if not containers:
                return False
                
            action_container = containers[0]
            buttons = action_container.find_elements(By.CSS_SELECTOR, "button")
            if not buttons:
                return False
                
            like_button = buttons[0]
            # Kiểm tra div bên trong có class bg-[#FE2C55]/90 không
            liked_div = like_button.find_elements(By.CSS_SELECTOR, "div.bg-\\[\\#FE2C55\\]\\/90")
            return len(liked_div) > 0
        except Exception as e:
            print(f"Error checking liked status: {e}")
            return False
    
    def add_comment(self, comment_text):
        """Thêm bình luận - button thứ 2 trong div.flex.flex-col"""
        try:
            # Loại bỏ emoji khỏi comment text (chỉ giữ ASCII và tiếng Việt)
            import re
            clean_text = re.sub(r'[^\x00-\x7F\u00C0-\u1EF9]+', '', comment_text)
            
            # Scroll to top để tránh stale
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.3)
            
            # Click nút comment (button thứ 2)
            action_container = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.flex.flex-col.gap-3"))
            )
            comment_button = action_container.find_element(By.CSS_SELECTOR, "button:nth-child(2)")
            self.driver.execute_script("arguments[0].click();", comment_button)
            time.sleep(1)
            
            # Tìm input với placeholder
            comment_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='Viết bình luận'], input[placeholder*='bình luận']"))
            )
            comment_input.click()
            comment_input.clear()
            comment_input.send_keys(clean_text)
            time.sleep(0.3)
            
            # Nhấn Enter để submit
            comment_input.send_keys(Keys.RETURN)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Error adding comment: {e}")
            return False
    
    def click_bookmark(self):
        """Click bookmark - button thứ 4 và đợi navigate đến /bookmarks"""
        try:
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.3)
            
            action_container = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.flex.flex-col.gap-3"))
            )
            bookmark_button = action_container.find_element(By.CSS_SELECTOR, "button:nth-child(4)")
            self.driver.execute_script("arguments[0].click();", bookmark_button)
            time.sleep(0.5)
            
            # Đợi frontend tự động navigate đến /bookmarks (timeout 5s)
            try:
                WebDriverWait(self.driver, 5).until(
                    lambda d: "/bookmarks" in d.current_url
                )
            except:
                # Nếu không tự navigate thì navigate thủ công
                self.driver.get(f"{Config.BASE_URL}/bookmarks")
                time.sleep(1)
            
            return True
        except Exception as e:
            print(f"Error clicking bookmark: {e}")
            return False
    
    def click_follow(self):
        """Click nút follow (+)"""
        try:
            # Scroll to top để tránh stale
            self.driver.execute_script("window.scrollTo(0, 0);");
            time.sleep(0.5)
            
            # Tìm nút follow có dấu + (tìm lại mỗi lần để tránh stale)
            follow_buttons = self.wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "button"))
            )
            for btn in follow_buttons:
                try:
                    btn_text = btn.text
                    if "+" in btn_text or "Theo dõi" in btn_text or "Follow" in btn_text:
                        self.driver.execute_script("arguments[0].click();", btn)
                        time.sleep(1)
                        return True
                except:
                    continue
            return False
        except Exception as e:
            print(f"Error clicking follow: {e}")
            return False
    
    def click_unfollow(self):
        """Click nút unfollow (✓)"""
        try:
            # Scroll to top để tránh stale
            self.driver.execute_script("window.scrollTo(0, 0);");
            time.sleep(0.5)
            
            # Tìm nút unfollow có dấu ✓ (tìm lại mỗi lần để tránh stale)
            unfollow_buttons = self.wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "button"))
            )
            for btn in unfollow_buttons:
                try:
                    btn_text = btn.text
                    if "✓" in btn_text or "Đang theo dõi" in btn_text or "Following" in btn_text:
                        self.driver.execute_script("arguments[0].click();", btn)
                        time.sleep(1)
                        return True
                except:
                    continue
            return False
        except Exception as e:
            print(f"Error clicking unfollow: {e}")
            return False
    
    def is_following(self):
        """Kiểm tra đã follow chưa"""
        try:
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            for btn in buttons:
                if "✓" in btn.text or "Đang theo dõi" in btn.text or "Following" in btn.text:
                    return True
            return False
        except:
            return False
    
    def click_share(self):
        """Click nút share - button thứ 3 (lucide-share2), copy link và đóng dialog"""
        try:
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.3)
            
            action_container = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.flex.flex-col.gap-3"))
            )
            share_button = action_container.find_element(By.CSS_SELECTOR, "button:nth-child(3)")
            self.driver.execute_script("arguments[0].click();", share_button)
            time.sleep(1)
            
            # Click nút copy link trong dialog (button có icon lucide-copy)
            try:
                copy_button = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button svg.lucide-copy"))
                )
                parent_button = copy_button.find_element(By.XPATH, "..")
                self.driver.execute_script("arguments[0].click();", parent_button)
                time.sleep(0.5)
            except Exception as e:
                print(f"Warning: Could not click copy button: {e}")
            
            # Đóng dialog bằng nút X
            try:
                close_button = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button svg.lucide-x"))
                )
                parent_button = close_button.find_element(By.XPATH, "..")
                self.driver.execute_script("arguments[0].click();", parent_button)
                time.sleep(0.3)
            except:
                # Fallback: nhấn Escape
                from selenium.webdriver.common.keys import Keys
                from selenium.webdriver.common.action_chains import ActionChains
                ActionChains(self.driver).send_keys(Keys.ESCAPE).perform()
                time.sleep(0.3)
            
            return True
        except Exception as e:
            print(f"Error clicking share: {e}")
            return False
    
    def get_clipboard_content(self):
        """Lấy nội dung clipboard"""
        try:
            import pyperclip
            return pyperclip.paste()
        except:
            return None
    
    def is_comment_button_enabled(self):
        """Kiểm tra nút gửi comment có enabled không"""
        try:
            # Kiểm tra input comment có value không
            comment_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Viết bình luận'], input[placeholder*='bình luận']")
            input_value = comment_input.get_attribute("value")
            # Nếu input rỗng thì button sẽ disabled
            return len(input_value) > 0
        except:
            return False
    
    def get_video_url(self):
        """Lấy URL của video hiện tại"""
        return self.driver.current_url
    
    def navigate_to_home(self):
        """Điều hướng về trang home"""
        self.driver.get(f"{Config.BASE_URL}/home")
        time.sleep(2)
        
        # Scroll một chút để trigger video load và play
        self.driver.execute_script("window.scrollTo(0, 100);")
        time.sleep(1)
        self.driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        
        # Đợi video element load
        try:
            video = self.driver.find_element(By.CSS_SELECTOR, "video")
            # Scroll đến video để trigger autoplay
            self.scroll_to_element(video)
            time.sleep(1)
            
            # Nếu video chưa play, click vào để play
            if video.get_property("paused"):
                video.click()
                time.sleep(0.5)
        except:
            pass
        
        return self
    
    def get_first_video(self):
        """Lấy video đầu tiên trong feed"""
        try:
            videos = self.driver.find_elements(By.CSS_SELECTOR, "video")
            if videos:
                return videos[0]
            return None
        except:
            return None
    
    def ensure_video_playing(self):
        """Đảm bảo video đang play (không navigate, chỉ trigger play)"""
        try:
            # Scroll một chút để trigger video detection
            self.driver.execute_script("window.scrollTo(0, 50);")
            time.sleep(0.5)
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.5)
            
            # Tìm và play video
            video = self.driver.find_element(By.CSS_SELECTOR, "video")
            self.scroll_to_element(video)
            time.sleep(0.5)
            
            # Nếu video chưa play, click để play
            if video.get_property("paused"):
                video.click()
                time.sleep(0.5)
        except:
            pass
    
    def click_avatar(self):
        """Click vào avatar để đi đến trang profile"""
        try:
            # Tìm avatar: div.w-12.h-12.rounded-full chứa img
            avatar = self.driver.find_element(By.CSS_SELECTOR, "div.w-12.h-12.rounded-full img")
            avatar.click()
            time.sleep(1.5)
            return True
        except Exception as e:
            print(f"Error clicking avatar: {e}")
            return False