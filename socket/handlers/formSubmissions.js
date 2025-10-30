const FormSubmission = require("../../models/formSubmission");
const {models} = require("../../models");
const { audit } = require("../../middleware/audit");
const createNotification = require("../../utils/createNotification");

module.exports = function formSubmissions(socket) {
    
    socket.on("submissions:list", async (params, ack) => {
      try {
        audit(socket, "submissions:list", params);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    
        const { form_id, userOnly = false, includeForm = false, includeUser = false } = params || {};
    
        const where = {};
        if (form_id) where.form_id = form_id;//filtering by form_id
        if (userOnly) where.submitted_by_id = socket.user.id;// to get only the current user’s submissions
    
        const submissions = await models.FormSubmission.findAll({
          where,
          order: [["submitted_at", "DESC"]],
          include: [
            //includeForm / includeUser to join related data
            includeForm && { model: models.Form, as: "form" },
            includeUser && { model: models.User, as: "submittedBy" },
          ].filter(Boolean),
        });
    
        //Uses ack for async confirmation instead of broadcasting (since listing is usually client-specific)
        ack && ack({ ok: true, submissions });//sends response only to the requesting client
      } catch (err) {
        console.error("submissions:list", err);
        ack && ack({ ok: false, error: "server_error in submissions:list" });
      }
    });
     
    /**createFormSubmission → adds a new submission and emits it to all connected clients */
    // socket.on('createFormSubmission', async (payload, ack) => {
    socket.on("submissions:submit", async (payload, ack) => {
        audit(socket, "submissions:submit", payload);
      if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
      try {
        const { id, form_id, values, serial_number, status } = payload || {};
        const submission = await FormSubmission.create({
          id,
          form_id,
          submitted_by_id: socket.user.id,
          values,
          serial_number,
          status,
          submitted_at: new Date()
        });
        ack && ack({ ok: true, submission });
        // io.emit('formSubmissionCreated', submission); // notify all clients
        socket.emit("submissions:submitted", payload);
        socket.broadcast.emit("submissions:submitted", payload);

        await createNotification(io, models, {
          user_id: socket.user.id,
          type: "form",
          item_id: submission.id,
          message: `✅ Form "${submission.form_id}" was successfully submitted.`,
        });
      } catch (err) {
        // console.error('createFormSubmission', err);
        console.error("submissions:submit", err);
        ack && ack({ ok: false, error: 'server_error in form submission' });
      }
    });


    socket.on("submissions:save-draft", async (payload, ack) => {
      try {
        audit(socket, "submissions:save-draft", payload);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    
        const { id, form_id, values, serial_number } = payload || {};
        const data = {
          form_id,
          values,
          serial_number,
          submitted_by_id: socket.user.id,
          status: "draft", //Sets status: 'draft'.
          submitted_at: new Date(),
        };
    
        // If `id` exists, update the existing draft
        // If an id is passed, updates that record (turns into “save progress”).
        let draft;

        if (id) {
          await models.FormSubmission.update(data, { where: { id } });
          draft = await models.FormSubmission.findByPk(id);
        } else {
          //If no id, creates a new draft.
          draft = await models.FormSubmission.create({ id: crypto.randomUUID(), ...data });
        }
    
        ack && ack({ ok: true, draft });
        //Emits both to sender and others for real-time collaboration (optional).
        socket.emit("submissions:drafted", draft);
        socket.broadcast.emit("submissions:drafted", draft);
      } catch (err) {
        console.error("submissions:save-draft", err);
        ack && ack({ ok: false, error: "server_error in submissions:save-draft" });
      }
    });

    socket.on("submissions:update-status", async (payload, ack) => {
      try {
        audit(socket, "submissions:update-status", payload);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    
        const { id, status } = payload;
        if (!id || !status) return ack && ack({ ok: false, error: "missing_id_or_status" });
    
        await models.FormSubmission.update({ status }, { where: { id } });
        const updated = await models.FormSubmission.findByPk(id);
    
        ack && ack({ ok: true, submission: updated });
        socket.emit("submissions:status-updated", updated);
        socket.broadcast.emit("submissions:status-updated", updated);
      } catch (err) {
        console.error("submissions:update-status", err);
        ack && ack({ ok: false, error: "server_error in submissions:update-status" });
      }
    });
    //This is useful for workflows where a manager approves or rejects submissions.
    socket.on("submissions:delete", async (payload, ack) => {
      try {
        audit(socket, "submissions:delete", payload);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    
        const { id } = payload;
        await models.FormSubmission.destroy({ where: { id } });
    
        ack && ack({ ok: true });
        socket.emit("submissions:deleted", { id });
        socket.broadcast.emit("submissions:deleted", { id });
      } catch (err) {
        console.error("submissions:delete", err);
        ack && ack({ ok: false, error: "server_error in submissions:delete" });
      }
    });
    //Since paranoid: true, this marks the record as deleted but doesn’t remove it permanently.


    // — permanent delete
    socket.on("submissions:destroy", async (payload, ack) => {
      try {
        audit(socket, "submissions:destroy", payload);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });

        const { id } = payload;
        await models.FormSubmission.destroy({ where: { id }, force: true });

        ack && ack({ ok: true });
        socket.emit("submissions:destroyed", { id });
        socket.broadcast.emit("submissions:destroyed", { id });
      } catch (err) {
        console.error("submissions:destroy", err);
        ack && ack({ ok: false, error: "server_error in submissions:destroy" });
      }
    });

    socket.on("submissions:get", async (payload, ack) => {
      try {
        audit(socket, "submissions:get", payload);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    
        const { id, includeForm = false, includeUser = false } = payload || {};
        if (!id) return ack && ack({ ok: false, error: "missing_id" });
    
        const submission = await models.FormSubmission.findByPk(id, {
          include: [
            includeForm && { model: models.Form, as: "form" },
            includeUser && { model: models.User, as: "submittedBy" },
          ].filter(Boolean), //to remove any falsy values (false, null, undefined, 0,'' or NaN) from an array
          //because sequelize expects the include array to contain only valid model object no falsy or undefined
        });
    
        if (!submission)
          return ack && ack({ ok: false, error: "not_found" });
    
        //Returns a single submission via ack — no broadcast needed.
        ack && ack({ ok: true, submission });
      } catch (err) {
        console.error("submissions:get", err);
        ack && ack({ ok: false, error: "server_error in submissions:get" });
      }
    });


    socket.on("submissions:restore", async (payload, ack) => {
      try {
        audit(socket, "submissions:restore", payload);
        if (!socket.user) return ack && ack({ ok: false, error: "unauthorized" });
    
        const { id } = payload;
        if (!id) return ack && ack({ ok: false, error: "missing_id" });
    
        //restore() only works when paranoid: true.
        await models.FormSubmission.restore({ where: { id } });
        const restored = await models.FormSubmission.findByPk(id);
    
        ack && ack({ ok: true, submission: restored });
    
        socket.emit("submissions:restored", restored);
        socket.broadcast.emit("submissions:restored", restored);
      } catch (err) {
        console.error("submissions:restore", err);
        ack && ack({ ok: false, error: "server_error in submissions:restore" });
      }
    });
    //////////////////////Anyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy  othersssssssssssssss ?????
};


/*

socket.on("submissions:submit", async (data) => {
  audit(socket, "submissions:submit", data);
  // Placeholder — implement Submission model
  socket.emit("submissions:submitted", data);
  socket.broadcast.emit("submissions:submitted", data);
});

socket.on("submissions:save-draft", async (data) => {
  audit(socket, "submissions:save-draft", data);
  socket.emit("submissions:draft-saved", data);
});


//  ========================FORM SUBMISSIONS========================
  // listFormSubmissions → gets all submissions of a form with user info 
    socket.on('listFormSubmissions', async ({ formId }, ack) => {
      try {
        const submissions = await FormSubmission.findAll({
          where: { form_id: formId },
          include: [
            { model: models.User, as: 'submittedBy', attributes: ['id','username'] }
          ],
          order: [['submitted_at','DESC']]
        });
        ack && ack({ ok: true, submissions });
      } catch (err) {
        console.error('listFormSubmissions', err);
        ack && ack({ ok: false, error: 'server_error in list form submissions' });
      }
    });


    // Update form submission
    // socket.on('updateFormSubmission', async (payload, ack) => {
    socket.on("submissions:save-draft", async (payload, ack) => {
        audit(socket, "submissions:save-draft", data);
        if (!socket.user) return ack && ack({ ok: false, error: 'unauthorized' });
      try {
        const { submissionId, fields } = payload || {};
        const submission = await models.FormSubmission.findByPk(submissionId);
        if (!submission) return ack && ack({ ok: false, error: 'not_found' });
        await submission.update(fields);
        ack && ack({ ok: true, data: submission });
        // io.emit('formSubmissionUpdated', submission);
        socket.emit("submissions:draft-saved", data);
        socket.broadcast.emit("submissions:draft-saved", data);

      } catch (err) {
        console.error("submissions:save-draft", err);
        ack && ack({ ok: false, error: 'server_error in updateFormSubmission' });
      }
    });

*/



/*

If you’re managing multiple models with similar CRUD behavior (e.g. columns, tasks, forms, submissions), you can generate or map socket events dynamically like:

const crudEvents = ["create", "get", "list", "update", "delete", "destroy", "restore"];
for (const event of crudEvents) {
  socket.on(`submissions:${event}`, (...args) => {
    handleSubmissionEvent(event, socket, ...args);
  });
}
That helps you keep your socket server maintainable long-term.

*/