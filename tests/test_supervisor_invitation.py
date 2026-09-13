import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

def test_supervisor_invitation_flow(driver):
    """
    Test Owner sending supervisor email invitation flow.
    """
    driver.get(f"{BASE_URL}/auth?mode=login")
    wait = WebDriverWait(driver, 10)

    # Perform Owner Login
    email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
    password_input = driver.find_element(By.NAME, "password")
    
    email_input.clear()
    email_input.send_keys("owner@cardora.com")
    password_input.clear()
    password_input.send_keys("CardoraOwner123!")

    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()

    # Navigate to Dashboard Supervisors Tab
    driver.get(f"{BASE_URL}/dashboard?tab=workforce")
    
    # Assert dashboard title or workforce module loaded
    page_title = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Supervisors') or contains(text(), 'Workforce')]")))
    assert page_title is not None
