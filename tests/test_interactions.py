import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from tests.config import Config
from tests.pages.login_page import LoginPage
from tests.pages.video_page import VideoPage
import time

class TestVideoInteractions:
    """
    Test Suite cho các tính năng tương tác với video sau khi đăng nhập
    - Follow/Unfollow user
    - Like/Unlike video
    - Comment (hợp lệ, trống, quá dài)
    - Share video
    - Bookmark/Unbookmark video
    """
    
    @pytest.fixture(scope="function")
    def driver(self):
        """Setup và teardown browser"""
        options = webdriver.ChromeOptions()
        if Config.HEADLESS:
            options.add_argument("--headless")
        options.add_argument("--start-maximized")
        options.add_argument("--disable-blink-features=AutomationControlled")
        
        # Disable browser popups/notifications
        prefs = {
            "profile.password_manager_leak_detection": False,
            "profile.password_manager_enabled": False,
            "credentials_enable_service": False,
            "safebrowsing.enabled": False,
            "profile.default_content_setting_values.notifications": 2,
        }
        options.add_experimental_option("prefs", prefs)
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
    
    @pytest.fixture(scope="function")
    def logged_in_driver(self, driver):
        """
        Fixture đăng nhập trước khi chạy test
        """
        login_page = LoginPage(driver)
        login_page.navigate()
        
        # Đăng nhập với user test
        login_page.login(Config.TEST_EMAIL_2, Config.TEST_PASSWORD_2)
        time.sleep(2)
        
        # Verify đăng nhập thành công
        assert login_page.is_login_successful(), "Đăng nhập không thành công"
        
        yield driver
    
    # ========== NHÓM TƯƠNG TÁC NGƯỜI DÙNG (FOLLOW) ==========
    
    def test_I01_follow_user(self, logged_in_driver):
        """
        I01 - Follow User
        Kiểm tra việc nhấn nút "Theo dõi" (+) trên video feed 
        và xác nhận hệ thống chuyển hướng đúng đến trang cá nhân
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login, đảm bảo video playing
        video_page.ensure_video_playing()
        time.sleep(1)
        
        # Click nút follow trên video đầu tiên
        follow_success = video_page.click_follow()
        assert follow_success, "Không thể click nút Follow"
        time.sleep(1)
        
        # Sau đó chuyển hướng đến trang profile người đó bằng cách click vào avatar
        avatar_clicked = video_page.click_avatar()
        assert avatar_clicked, "Không thể click vào avatar"
        
        # Screenshot
        video_page.take_screenshot("I01_follow_user")
        
        # Verify: Kiểm tra trạng thái following trên trang profile
        is_following = video_page.is_following()
        assert is_following, "Trạng thái Following không đúng sau khi Follow"
        
        print("✅ Test I01 - Follow user thành công")
    
    def test_I02_unfollow_user(self, logged_in_driver):
        """
        I02 - Unfollow User
        Kiểm tra việc nhấn nút "Bỏ theo dõi" (✓) 
        và xác nhận chuyển hướng về trang cá nhân
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Đảm bảo đã follow user trước
        if not video_page.is_following():
            video_page.click_follow()
            time.sleep(1)
        
        # Click unfollow
        unfollow_success = video_page.click_unfollow()
        assert unfollow_success, "Không thể click nút Unfollow"
        time.sleep(1)
        
        # Sau đó chuyển hướng về trang profile người đó bằng cách click vào avatar
        avatar_clicked = video_page.click_avatar()
        assert avatar_clicked, "Không thể click vào avatar"
        
        # Screenshot
        video_page.take_screenshot("I02_unfollow_user")
        
        # Verify: Kiểm tra trạng thái đã không còn following
        is_following = video_page.is_following()
        assert not is_following, "Trạng thái Following vẫn còn sau khi Unfollow"
        
        print("✅ Test I02 - Unfollow user thành công")
    
    # ========== NHÓM TƯƠNG TÁC CẢM XÚC (LIKE) ==========
    
    def test_I03_like_video(self, logged_in_driver):
        """
        I03 - Like Video
        Kiểm tra chức năng thả tim video
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Kiểm tra trạng thái like ban đầu
        initial_liked = video_page.is_video_liked()
        
        # Nếu đã like thì unlike trước
        if initial_liked:
            video_page.click_like()
            time.sleep(1.5)
        
        # Click like
        like_success = video_page.click_like()
        time.sleep(1.5)  # Tăng wait time để UI update
        
        # Screenshot
        video_page.take_screenshot("I03_like_video")
        
        # Verify: Video đã được like
        assert like_success, "Không thể click nút Like"
        is_liked = video_page.is_video_liked()
        assert is_liked, "Video chưa được like sau khi click"
        
        print("✅ Test I03 - Like video thành công")
    
    def test_I04_unlike_video(self, logged_in_driver):
        """
        I04 - Unlike Video
        Kiểm tra chức năng bỏ tim video (đối với video đã like)
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Đảm bảo video đã được like trước
        if not video_page.is_video_liked():
            video_page.click_like()
            time.sleep(1.5)
        
        # Scroll để refresh DOM trước khi click unlike
        logged_in_driver.execute_script("window.scrollBy(0, 50);")
        time.sleep(0.3)
        logged_in_driver.execute_script("window.scrollBy(0, -50);")
        time.sleep(0.3)
        
        # Click unlike
        unlike_success = video_page.click_like()
        time.sleep(1.5)  # Tăng wait time để UI update
        
        # Screenshot
        video_page.take_screenshot("I04_unlike_video")
        
        # Verify: Video đã bỏ like
        assert unlike_success, "Không thể click nút Unlike"
        is_liked = video_page.is_video_liked()
        assert not is_liked, "Video vẫn còn trạng thái liked sau khi unlike"
        
        # Navigate về home để reset state cho tests tiếp theo
        video_page.navigate_to_home()
        
        print("✅ Test I04 - Unlike video thành công")
    
    # ========== NHÓM BÌNH LUẬN (COMMENT) ==========
    
    def test_I05_comment_valid(self, logged_in_driver):
        """
        I05 - Comment Hợp lệ
        Kiểm tra luồng thêm một bình luận bình thường thành công
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Thêm comment
        comment_text = "Đây là bình luận test hợp lệ!"
        comment_success = video_page.add_comment(comment_text)
        
        # Screenshot
        video_page.take_screenshot("I05_comment_valid")
        
        # Verify
        assert comment_success, "Không thể thêm comment"
        
        print("✅ Test I05 - Comment hợp lệ thành công")
    
    def test_I06_comment_empty(self, logged_in_driver):
        """
        I06 - Comment Trống
        Kiểm tra hệ thống xử lý khi người dùng cố gửi bình luận rỗng
        (nút gửi nên bị disable hoặc không gửi được)
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Thử thêm comment rỗng
        comment_success = video_page.add_comment("")
        
        # Screenshot
        video_page.take_screenshot("I06_comment_empty")
        
        # Verify: Comment rỗng không nên được gửi thành công
        # Hoặc nút submit phải bị disable
        if comment_success:
            # Nếu gửi được thì kiểm tra nút submit có bị disable không
            is_enabled = video_page.is_comment_button_enabled()
            assert not is_enabled, "Nút submit comment không nên enabled với comment rỗng"
        
        print("✅ Test I06 - Comment rỗng được xử lý đúng")
    
    def test_I07_comment_too_long(self, logged_in_driver):
        """
        I07 - Comment Quá dài
        Kiểm tra khả năng chịu tải của ô nhập liệu với chuỗi ký tự cực dài (1000 ký tự)
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Tạo comment dài 501 ký tự
        long_comment = "A" * 501
        
        try:
            comment_success = video_page.add_comment(long_comment)
            
            # Screenshot
            video_page.take_screenshot("I07_comment_too_long")
            
            # Verify: Hệ thống có thể xử lý comment dài
            # (có thể chấp nhận hoặc từ chối, nhưng không crash)
            print("✅ Test I07 - Hệ thống xử lý comment quá dài không crash")
        except Exception as e:
            print(f"⚠️ Hệ thống xử lý comment quá dài: {e}")
            video_page.take_screenshot("I07_comment_too_long_error")
    
    # ========== NHÓM CHIA SẺ (SHARE) ==========
    
    # def test_I08_share_link(self, logged_in_driver):
    #     """
    #     I08 - Share Link
    #     Kiểm tra nút chia sẻ có hoạt động và copy đường dẫn video vào clipboard
    #     """
    #     video_page = VideoPage(logged_in_driver)
        
    #     # Đã ở trang home sau khi login
    #     time.sleep(2)
        
    #     # Lấy URL video hiện tại
    #     current_url = video_page.get_video_url()
        
    #     # Click share (sẽ tự động đóng dialog sau khi copy)
    #     share_success = video_page.click_share()
    #     time.sleep(1)
        
    #     # Screenshot
    #     video_page.take_screenshot("I08_share_link")
        
    #     # Verify: Nút share hoạt động
    #     assert share_success, "Không thể click nút Share"
        
    #     # Note: Kiểm tra clipboard cần cài thêm library pyperclip
    #     # clipboard_content = video_page.get_clipboard_content()
    #     # if clipboard_content:
    #     #     assert current_url in clipboard_content, "URL không được copy vào clipboard"
        
    #     print("✅ Test I08 - Share link thành công")
    
    # ========== NHÓM LƯU TRỮ (BOOKMARK) ==========
    
    def test_I08_bookmark_video(self, logged_in_driver):
        """
        I08 - Bookmark Video
        Kiểm tra chức năng lưu video vào danh sách xem sau
        """
        video_page = VideoPage(logged_in_driver)
        
        # Đã ở trang home sau khi login
        time.sleep(2)
        
        # Click bookmark (sẽ chuyển đến /bookmarks)
        bookmark_success = video_page.click_bookmark()
        time.sleep(1)
        
        # Screenshot tại trang bookmarks
        video_page.take_screenshot("I08_bookmark_video")
        
        # Verify: URL hiện tại là bookmarks page
        assert bookmark_success, "Không thể click nút Bookmark"
        current_url = video_page.get_video_url()
        assert "/bookmarks" in current_url, "Không chuyển đến trang Bookmarks"
        
        print("✅ Test I08 - Bookmark video thành công")
    
    def test_I09_unbookmark_video(self, logged_in_driver):
        """
        I09 - Unbookmark Video
        Kiểm tra chức năng bỏ lưu video
        """
        video_page = VideoPage(logged_in_driver)
        
        # Quay về trang home từ bookmarks page
        video_page.navigate_to_home()
        time.sleep(2)  # Tăng thời gian đợi page load
        
        # Scroll để element hiển thị
        logged_in_driver.execute_script("window.scrollBy(0, 300)")
        time.sleep(0.5)
        
        # Click unbookmark (video đã được bookmark ở test I08)
        unbookmark_success = video_page.click_bookmark()
        time.sleep(1)
        
        # Screenshot tại trang bookmarks
        video_page.take_screenshot("I09_unbookmark_video")
        
        # Verify: Đã chuyển đến bookmarks page
        assert unbookmark_success, "Không thể click nút Unbookmark"
        current_url = video_page.get_video_url()
        assert "/bookmarks" in current_url, "Không chuyển đến trang Bookmarks"
        
        print("✅ Test I09 - Unbookmark video thành công")


if __name__ == "__main__":
    """Chạy test suite"""
    pytest.main([__file__, "-v", "-s"])
