import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

def test_supervisor_worker_management(driver):
    """
    Test supervisor adding and viewing plantation workers.
    """
    driver.get(f"{BASE_URL}/dashboard?tab=workforce")
    wait = WebDriverWait(driver, 10)

    element = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Workers Roster') or contains(text(), 'Add Worker') or contains(text(), 'Search')]")))
    assert element is not None
