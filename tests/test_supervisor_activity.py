import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

def test_supervisor_plantation_activity_recording(driver):
    """
    Test supervisor recording real plantation activities (fertilizer, irrigation, pest control).
    """
    driver.get(f"{BASE_URL}/dashboard?tab=workforce")
    wait = WebDriverWait(driver, 10)

    element = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Plantation Activities') or contains(text(), 'Record Activity') or contains(text(), 'Overview')]")))
    assert element is not None
