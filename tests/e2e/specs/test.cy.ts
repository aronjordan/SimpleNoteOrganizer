describe('Notes Organizer', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('Simple Notes Organizer')
    cy.contains('No notes yet')
  })
})
