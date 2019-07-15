// This whole file (pg-resource.js) is responsible for firing SQL Queries
function tagsQueryString(tags, itemid, result) {
  const length = tags.length;
  return length === 0
    ? `${result};`
    : tags.shift() &&
        tagsQueryString(
          tags,
          itemid,
          `${result}($${tags.length + 1}, ${itemid})${length === 1 ? "" : ","}`
        );
}

module.exports = postgres => {
  return {
    async createUser({ fullname, email, password }) {
      const newUserInsert = {
        text: "",
        values: [fullname, email, password]
      };
      try {
        const user = await postgres.query(newUserInsert);
        return user.rows[0];
      } catch (e) {
        switch (true) {
          case /users_fullname_key/.test(e.message):
            throw "An account with this username already exists.";
          case /users_email_key/.test(e.message):
            throw "An account with this email already exists.";
          default:
            throw "There was a problem creating your account.";
        }
      }
    },
    async getUserAndPasswordForVerification(email) {
      const findUserQuery = {
        text: "",
        values: [email]
      };
      try {
        const user = await postgres.query(findUserQuery);
        if (!user) throw "User was not found.";
        return user.rows[0];
      } catch (e) {
        throw "User was not found.";
      }
    },
    async getUserById(id) {
      const findUserQuery = {
        // This Query is looking for an id thats coming from index.js
        text: "SELECT * FROM users WHERE id = $1 LIMIT 1;",
        // 1st value of the array will represent $1 and 2nd value will represent $2. etc
        values: [id]
      };

      try {
        const user = await postgres.query(findUserQuery);
        return user.rows[0];
      } catch (e) {
        throw "User cant be found";
      }
    },
    async getItems(idToOmit) {
      const items = await postgres.query({
        // This Query lets the user only see items from other people on the front page
        text: `SELECT * FROM items WHERE ownerId = $1`,
        values: idToOmit ? [idToOmit] : []
      });
      try {
        const returnItems = await postgres.query(items);
        return returnItems.rows[0];
      } catch (e) {
        throw "Item can't be found";
      }
    },
    async getItemsForUser(id) {
      const items = await postgres.query({
        // This Query refers to the user's profile page where
        // the user can only see their own items
        text: `SELECT * FROM items WHERE ownerId = $1;`,
        values: [id]
      });
      try {
        const getItems = await postgres.query(items);
        return getItems.rows[0];
      } catch (e) {
        throw "Item can't be found";
      }
    },
    async getBorrowedItemsForUser(id) {
      const items = await postgres.query({
        text: `SELECT * FROM items WHERE (borrowerid = $1);`,
        values: [id]
      });
      try {
        const getItems = await postgres.query(items);
        return getItems.rows[0];
      } catch (e) {
        throw "Item can't be found";
      }
    },

    async getTags() {
      const tags = await postgres.query({
        text: `SELECT * FROM tags`,
        values: [id]
      });
      try {
        const returnTags = await postgres.query(tags);
        return returnTags.rows[0];
      } catch (e) {
        throw "Tags can't be found";
      }
    },

    async getTagsForItem(id) {
      const tagsQuery = {
        text: `SELECT * FROM a.items, b.tags INNER JOIN a ON b;`,
        values: [id]
      };
      try {
        const tags = await postgres.query(tagsQuery);
        return tags.rows[0];
      } catch (e) {
        throw "Tags can't be found";
      }
    },
    async saveNewItem({ item, image, user }) {
      return new Promise((resolve, reject) => {
        postgres.connect((err, client, done) => {
          try {
            client.query("BEGIN", async err => {
              const { title, description, tags } = item;
              const tagVal = tags.map(tag => tag.id);

              const newItem = await client.query({
                // This Query lets you save items into the items table
                text: `INSERT INTO items (title, description, ownerId) VALUES ($1, $2, 1) RETURNING *`,
                values: [title, description]
              });

              const newItemId = newItem.rows[0];
              const idInsert = newItemId.id;

              const newItemsTags = await client.query({
                text: `INSERT INTO items_tags (tagsid, itemsid) VALUES ${tagsQueryString(
                  tags,
                  newItem.rows[0].id,
                  ""
                )}`,
                values: tagVal
              });

              client.query("COMMIT", err => {
                if (err) {
                  throw err;
                }
                done();
                resolve(newItem.rows[0]);
              });
            });
          } catch (e) {
            client.query("ROLLBACK", err => {
              if (err) {
                throw err;
              }
              done();
            });
            switch (true) {
              default:
                throw e;
            }
          }
        });
      });
    }
  };
};
