import time
import os
import traceback
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

FILE_PATH = os.path.abspath("index.html")
BASE_URL = f"file:///{FILE_PATH}"

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def capture_screenshot(driver, name):
    driver.save_screenshot(name)
    print(f"  [SNAPSHOT] Saved {name}")

def save_logs(message):
    with open("test_logs.txt", "a") as f:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{timestamp}] {message}\n")

def flow_a_negative(driver):
    print("\n--- Flow A: Negative Scenario ---")
    driver.get(BASE_URL)
    print(f"  Page Title: {driver.title}")
    print(f"  Page URL: {driver.current_url}")

    driver.find_element(By.ID, "firstName").send_keys("TestUser")
    driver.find_element(By.ID, "email").send_keys("test@example.com")
    driver.find_element(By.ID, "phone").send_keys("+1 555 019 2834")
    
    driver.find_element(By.CSS_SELECTOR, "input[value='Male']").find_element(By.XPATH, "./..").click()
    
    driver.find_element(By.ID, "password").send_keys("StrongP@ss1")
    driver.find_element(By.ID, "confirmPassword").send_keys("StrongP@ss1")
    
    driver.find_element(By.ID, "terms").find_element(By.XPATH, "./..").click()

    submit_btn = driver.find_element(By.ID, "submitBtn")
    
    if not submit_btn.is_enabled():
        print("  [PASS] Submit button is correctly disabled due to missing fields.")
    else:
        print("  [FAIL] Submit button is enabled despite missing Last Name!")
        submit_btn.click() 

    last_name = driver.find_element(By.ID, "lastName")
    last_name.click()
    driver.find_element(By.ID, "firstName").click() 
    
    time.sleep(0.5)
    error_msg = driver.find_element(By.ID, "lastNameError")
    
    if error_msg.is_displayed(): 
        print(f"  [PASS] Error message displayed: '{error_msg.text}'")
    else:
        print("  [INFO] Error message might not be visible yet if not interacted, but button disabled is key.")
        
    capture_screenshot(driver, "error-state.png")
    
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(0.5)
    capture_screenshot(driver, "full-page-error.png")

def flow_b_positive(driver):
    print("\n--- Flow B: Positive Scenario ---")
    driver.refresh()
    time.sleep(1)
    
    driver.find_element(By.ID, "firstName").send_keys("John")
    driver.find_element(By.ID, "lastName").send_keys("Doe")
    driver.find_element(By.ID, "email").send_keys("john.doe@valid.com")
    driver.find_element(By.ID, "phone").send_keys("+1 123 456 7890")
    
    driver.find_element(By.CSS_SELECTOR, "input[value='Male']").find_element(By.XPATH, "./..").click()
    
    driver.find_element(By.ID, "address").send_keys("123 Automation St")
    
    Select(driver.find_element(By.ID, "country")).select_by_value("USA")
    Select(driver.find_element(By.ID, "state")).select_by_value("California")
    Select(driver.find_element(By.ID, "city")).select_by_value("Los Angeles")
    
    driver.find_element(By.ID, "password").send_keys("SuperSecret1!")
    driver.find_element(By.ID, "confirmPassword").send_keys("SuperSecret1!")
    
    driver.find_element(By.ID, "terms").find_element(By.XPATH, "./..").click()
    
    submit_btn = driver.find_element(By.ID, "submitBtn")
    if submit_btn.is_enabled():
        print("  [PASS] Submit button is enabled with valid data.")
        submit_btn.click()
    else:
        print("  [FAIL] Submit button is still disabled!")
        invalids = driver.find_elements(By.CLASS_NAME, "invalid")
        if invalids:
            print(f"  [DEBUG] Invalid fields found: {[i.get_attribute('id') for i in invalids]}")
        return

    try:
        modal = WebDriverWait(driver, 5).until(
            EC.visibility_of_element_located((By.ID, "successModal"))
        )
        print("  [PASS] Success Modal appeared.")
        capture_screenshot(driver, "success-state.png")
        
        driver.find_element(By.ID, "closeModal").click()
        
        first_name_val = driver.find_element(By.ID, "firstName").get_attribute("value")
        if first_name_val == "":
             print("  [PASS] Form fields reset.")
        else:
             print("  [FAIL] Form fields did not reset.")
             
    except Exception as e:
        print(f"  [FAIL] Success modal did not appear. {e}")

def flow_c_logic(driver):
    print("\n--- Flow C: Form Logic Validation ---")
    driver.refresh()
    
    country_dd = Select(driver.find_element(By.ID, "country"))
    state_dd = Select(driver.find_element(By.ID, "state"))
    city_dd = Select(driver.find_element(By.ID, "city"))
    
    country_dd.select_by_value("India")
    time.sleep(0.5)
    
    state_options = [o.text for o in state_dd.options]
    if "Maharashtra" in state_options:
        print("  [PASS] Country update triggered State options update.")
    else:
        print("  [FAIL] State options not updated for India.")
        
    state_dd.select_by_value("Maharashtra")
    time.sleep(0.5)
    
    city_options = [o.text for o in city_dd.options]
    if "Mumbai" in city_options:
        print("  [PASS] State update triggered City options update.")
    else:
        print("  [FAIL] City options not updated for Maharashtra.")
        
    pwd = driver.find_element(By.ID, "password")
    pwd.send_keys("weak")
    time.sleep(0.2)
    strength_text = driver.find_element(By.ID, "strengthText").text
    if strength_text == "Weak":
        print("  [PASS] Weak password detected.")
    
    pwd.clear()
    pwd.send_keys("StrongP@ss1") 
    time.sleep(0.2)
    strength_text = driver.find_element(By.ID, "strengthText").text
    if strength_text == "Strong":
        print("  [PASS] Strong password detected.")
        
    confirm = driver.find_element(By.ID, "confirmPassword")
    confirm.send_keys("Mismatch")
    pwd.click() 
    time.sleep(0.5)
    
    confirm_error = driver.find_element(By.ID, "confirmPasswordError")
    if confirm_error.is_displayed() or "invalid" in confirm.get_attribute("class"):
        print("  [PASS] Mismatched password validation works.")
    else:
        print("  [FAIL] Mismatched password error not shown.")

def main():
    driver = setup_driver()
    try:
        flow_a_negative(driver)
        save_logs("Flow A completed")
        flow_b_positive(driver)
        save_logs("Flow B completed")
        flow_c_logic(driver)
        save_logs("Flow C completed")
    except Exception as e:
        save_logs(f"Error: {e}")
        print(f"An error occurred: {e}")
    finally:
        print("\nAll flows completed. Closing driver...")
        driver.quit()

if __name__ == "__main__":
    main()
