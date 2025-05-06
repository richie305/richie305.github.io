describe("Favorites", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it("should add a new bathroom favorite", () => {
    // Open favorites modal
    cy.get("#edit-favorites-btn").click();

    // Add a new favorite
    cy.get("#add-favorite-btn").click();
    cy.get('.favorite-field input[type="text"]').type("Morning Bathroom");
    cy.get(".favorite-field select.favorite-type").select("bathroom");
    cy.get(".favorite-field select.favorite-location").select("outside");
    cy.get(".favorite-field select.favorite-size").select("medium");
    cy.get(".favorite-field select.favorite-consistency").select("normal");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Wait for modal to close and success message
    cy.get("#favorites-modal").should("not.be.visible");
    cy.get(".success-message").should("be.visible");
    cy.get(".success-message").should("not.exist");

    // Verify the favorite appears in the list
    cy.get("#favorites-list").should("contain", "Morning Bathroom");

    // Click the favorite and verify it fills the bathroom form
    cy.get("#favorites-list button").contains("Morning Bathroom").click();
    cy.get('#bathroom-form input[name="type"][value="bathroom"]').should(
      "be.checked",
    );
    cy.get('#bathroom-form input[name="location"][value="outside"]').should(
      "be.checked",
    );
    cy.get('#bathroom-form input[name="size"][value="medium"]').should(
      "be.checked",
    );
    cy.get('#bathroom-form input[name="consistency"][value="normal"]').should(
      "be.checked",
    );
  });

  it("should add a new food favorite", () => {
    // Open favorites modal
    cy.get("#edit-favorites-btn").click();

    // Add a new favorite
    cy.get("#add-favorite-btn").click();
    cy.get('.favorite-field input[type="text"]').type("Breakfast");
    cy.get(".favorite-field select.favorite-type").select("food");
    cy.get(".favorite-field select.favorite-location").select("inside");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Wait for modal to close and success message
    cy.get("#favorites-modal").should("not.be.visible");
    cy.get(".success-message").should("be.visible");
    cy.get(".success-message").should("not.exist");

    // Verify the favorite appears in the list
    cy.get("#favorites-list").should("contain", "Breakfast");

    // Click the favorite and verify it fills the food form
    cy.get("#favorites-list button").contains("Breakfast").click();
    cy.get("#food-type").should("have.value", "Breakfast");
    cy.get("#food-location").should("have.value", "inside");
  });

  it("should remove a favorite", () => {
    // Open favorites modal
    cy.get("#edit-favorites-btn").click();

    // Add a favorite
    cy.get("#add-favorite-btn").click();
    cy.get('.favorite-field input[type="text"]').type("Evening Walk");

    // Remove the favorite
    cy.get(".remove-favorite").click();

    // Save favorites
    cy.get("#favorites-form").submit();

    // Wait for modal to close and success message
    cy.get("#favorites-modal").should("not.be.visible");
    cy.get(".success-message").should("be.visible");
    cy.get(".success-message").should("not.exist");

    // Verify the favorite is not in the list
    cy.get("#favorites-list").should("not.contain", "Evening Walk");
  });

  it("should edit existing favorites", () => {
    // Open favorites modal
    cy.get("#edit-favorites-btn").click();

    // Add a favorite
    cy.get("#add-favorite-btn").click();
    cy.get('.favorite-field input[type="text"]').type("Original Name");
    cy.get(".favorite-field select.favorite-type").select("bathroom");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Wait for modal to close and success message
    cy.get("#favorites-modal").should("not.be.visible");
    cy.get(".success-message").should("be.visible");
    cy.get(".success-message").should("not.exist");

    // Open modal again
    cy.get("#edit-favorites-btn").click();

    // Edit the favorite
    cy.get('.favorite-field input[type="text"]').clear().type("Updated Name");
    cy.get(".favorite-field select.favorite-type").select("food");
    cy.get(".favorite-field select.favorite-location").select("inside");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Wait for modal to close and success message
    cy.get("#favorites-modal").should("not.be.visible");
    cy.get(".success-message").should("be.visible");
    cy.get(".success-message").should("not.exist");

    // Verify the updated name appears
    cy.get("#favorites-list").should("contain", "Updated Name");
    cy.get("#favorites-list").should("not.contain", "Original Name");

    // Click the favorite and verify it fills the food form
    cy.get("#favorites-list button").contains("Updated Name").click();
    cy.get("#food-type").should("have.value", "Updated Name");
    cy.get("#food-location").should("have.value", "inside");
  });
});
