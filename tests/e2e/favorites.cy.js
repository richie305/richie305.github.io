describe("Favorites", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should add a new favorite", () => {
    // Open favorites modal
    cy.get("#edit-favorites-btn").click();

    // Add a new favorite
    cy.get("#add-favorite-btn").click();
    cy.get('.favorite-field input[type="text"]').type("Morning Walk");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Verify the favorite appears in the list
    cy.get("#favorites-list").should("contain", "Morning Walk");
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

    // Verify the favorite is not in the list
    cy.get("#favorites-list").should("not.contain", "Evening Walk");
  });

  it("should edit existing favorites", () => {
    // Open favorites modal
    cy.get("#edit-favorites-btn").click();

    // Add a favorite
    cy.get("#add-favorite-btn").click();
    cy.get('.favorite-field input[type="text"]').type("Original Name");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Open modal again
    cy.get("#edit-favorites-btn").click();

    // Edit the favorite
    cy.get('.favorite-field input[type="text"]').clear().type("Updated Name");

    // Save favorites
    cy.get("#favorites-form").submit();

    // Verify the updated name appears
    cy.get("#favorites-list").should("contain", "Updated Name");
    cy.get("#favorites-list").should("not.contain", "Original Name");
  });
});
