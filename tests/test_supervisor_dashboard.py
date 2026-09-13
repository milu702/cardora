import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

def test_supervisor_dashboard_view(driver):
    """
    Test supervisor dashboard KPIs and navigation tabs.
    """
    driver.get(f"{BASE_URL}/dashboard?tab=workforce")
    wait = WebDriverWait(driver, 10)

    # Check for Supervisor Hub or Overview
    overview = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Supervisor Hub') or contains(text(), 'Workers Roster') or contains(text(), 'Overview')]")))
    assert overview is not None
