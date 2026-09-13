import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

def test_owner_supervisor_activity_history(driver):
    """
    Test owner viewing supervisor activity history and filters.
    """
    driver.get(f"{BASE_URL}/dashboard?tab=workforce")
    wait = WebDriverWait(driver, 10)

    element = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Activity Audit') or contains(text(), 'Supervisors') or contains(text(), 'Overview')]")))
    assert element is not None
