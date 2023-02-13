Feature: Coffee

  Scenario: Get a coffee by id
    Given the server is running
    When I GET "/coffees" 1
    Then the server should return a coffee

  Scenario: Error getting a coffee by id
    Given the server is running
    When I GET "/coffees" 3
    Then the server should return an error

  Scenario: Create a coffee
    Given the server is running
    When I POST "/coffees"
    Then the server should create a coffee

  Scenario: Update a coffee
    Given the server is running
    When I PATCH "/coffees" 1
    Then the server should update a coffee

  Scenario: Delete a coffee
    Given the server is running
    When I DELETE "/coffees" 6
    Then the server should delete a coffee
