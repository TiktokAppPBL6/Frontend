import pytest
import sys
import os

# Thêm thư mục gốc vào Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

if __name__ == "__main__":
    # Chạy tất cả tests với báo cáo HTML
    pytest.main([
        "-v",  # Verbose
        "--html=tests/report.html",  # Tạo báo cáo HTML
        "--self-contained-html",  # Báo cáo standalone
        "tests/",  # Thư mục chứa tests
    ])