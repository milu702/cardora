import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

def test_supervisor_acceptance_page(driver):
    """
    Test Supervisor opening invitation acceptance page via link token.
    """
    sample_token = "test_invitation_token_12345"
    driver.get(f"{BASE_URL}/accept-invitation?token={sample_token}")
    wait = WebDriverWait(driver, 10)

    # Check for invitation heading or Cardora logo
    heading = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'CARDORA') or contains(text(), 'Invitation')]")))
    assert heading is not None
