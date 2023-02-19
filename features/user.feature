Feature: User

  Scenario: Create a user
    Given I subscribed to user created
    When I create a user
    Then I should be notified on user creation
