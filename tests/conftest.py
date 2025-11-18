import pytest
from pathlib import Path
import glob
import os

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Attach screenshots to HTML report after each test"""
    outcome = yield
    report = outcome.get_result()
    
    # Chỉ xử lý khi test kết thúc (call phase)
    if report.when == 'call':
        extras = getattr(report, 'extras', [])
        
        # Tìm screenshot của test này (theo pattern tên test)
        test_name = item.name
        screenshot_dir = Path(__file__).parent / "screenshots"
        
        if screenshot_dir.exists():
            # Tìm tất cả screenshot có tên chứa test name
            pattern = f"{test_name}_*.png"
            screenshots = glob.glob(str(screenshot_dir / pattern))
            
            # Nếu không tìm thấy, thử pattern không có timestamp
            if not screenshots:
                pattern = f"{test_name}.png"
                screenshots = glob.glob(str(screenshot_dir / pattern))
            
            # Attach tất cả screenshots vào report
            for screenshot_path in screenshots:
                if os.path.exists(screenshot_path):
                    # Chuyển đường dẫn thành relative để HTML report hiển thị đúng
                    rel_path = os.path.relpath(screenshot_path, start=Path(__file__).parent)
                    extras.append(pytest.html.extras.image(rel_path))
        
        report.extras = extras
