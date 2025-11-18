import os
from datetime import datetime

class Config:
    """Configuration for Selenium tests"""
    
    # Application URLs
    BASE_URL = "http://localhost:3000"
    API_BASE_URL = "http://localhost:8000"
    
    # Timeouts (seconds)
    IMPLICIT_WAIT = 10
    EXPLICIT_WAIT = 20
    PAGE_LOAD_TIMEOUT = 30
    
    # đki
    TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
    TEST_USERNAME = f"nguyenanh"
    TEST_EMAIL = f"{TEST_USERNAME}@gmail.com"
    TEST_PASSWORD = "anh123456"
    TEST_FULLNAME = "Nguyen Anh"
    
     # email chưa ton tai
    TEST_USERNAME_1 = f"nguyenngocanh"
    TEST_EMAIL_1 = f"{TEST_USERNAME_1}@gmail.com"
    TEST_PASSWORD_1 = "anh123456"
    TEST_FULLNAME_1 = "Nguyen Ngoc Anh"
    
    # da co san trong he thong
    TEST_USERNAME_2 = f"anhnn"
    TEST_EMAIL_2 = f"anhnn1201@gmail.com"
    TEST_PASSWORD_2 = "ngocanh"
    TEST_FULLNAME_2 = "Nguyễn Thị Ngọc Ánh 4"
    
    TEST_VIDEO_TITLE="Khi deadline là thứ Bảy, nhưng hôm nay là Thứ Sáu."
    TEST_VIDEO_DESCRIPTION="Xin vũ trụ hãy độ con qua tuần này. #deadline #vanphong #xuhuong #comedy"
    
    # Test data paths
    TEST_DATA_DIR = os.path.abspath("tests/test_data")
    TEST_VIDEO_PATH = os.path.join(TEST_DATA_DIR, "video.mp4")
    TEST_LONG_VIDEO_PATH = os.path.join(TEST_DATA_DIR, "videomore2m.mp4")    # > 2 phút
    
    # Validation limits
    MAX_EMAIL_LENGTH = 255
    MAX_USERNAME_LENGTH = 50
    MIN_USERNAME_LENGTH = 3
    MAX_FULLNAME_LENGTH = 100
    MIN_FULLNAME_LENGTH = 1
    MAX_PASSWORD_LENGTH = 100
    MIN_PASSWORD_LENGTH = 6
    MAX_TITLE_LENGTH = 150
    MAX_DESCRIPTION_LENGTH = 500
    MAX_VIDEO_SIZE_MB = 100
    MAX_VIDEO_DURATION_SEC = 600  # 10 phút
    
    # Browser settings
    BROWSER = "chrome"  # chrome, firefox, edge
    HEADLESS = False  # Set to True for CI/CD
    WINDOW_SIZE = "1920,1080"
    
    # Test results
    SCREENSHOT_DIR = os.path.abspath("tests/screenshots")
    REPORT_DIR = os.path.abspath("tests/reports")
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist"""
        for directory in [cls.TEST_DATA_DIR, cls.SCREENSHOT_DIR, cls.REPORT_DIR]:
            os.makedirs(directory, exist_ok=True)