const { audit } = require("../../middleware/audit");
const { v4: uuidv4 } = require("uuid");
const models = require("../../models");
const requireAuth = require("../../middleware/requireAuth");

module.exports = function learning(socket) {
  const {
    LearningAssignment,
    Book,
    MicroLearning,
    YouTubeVideo,
    Podcast,
    Course,
    User,
  } = models;

  /* -------------------------
     Helper to standardise list handlers
  -------------------------*/
  const safeList = async (Model, opt = {}, ackKey = "items", ack) => {
    try {
      const items = await Model.findAll(opt);
      ack && ack({ ok: true, [ackKey]: items });
    } catch (err) {
      console.error(`${Model.name}:list`, err);
      ack && ack({ ok: false, error: `server_error in ${Model.name}:list` });
    }
  };
  /******************* 📘 BOOKS *******************/
  socket.on("books:create", async (payload, ack) => {
    audit(socket, "books:create", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const book = await Book.create({
        id: payload.id || uuidv4(),
        title: payload.title,
        author: payload.author,
        cover_image_url: payload.cover_image_url,
      });

      ack && ack({ ok: true, book });
      socket.emit("books:created", book);
      socket.broadcast.emit("books:created", book);
    } catch (err) {
      console.error("books:create", err);
      ack && ack({ ok: false, error: "server_error in books:create" });
    }
  });

  socket.on("books:update", async (payload, ack) => {
    audit(socket, "books:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { id, ...fields } = payload;
      await Book.update(fields, { where: { id } });
      const updated = await Book.findByPk(id);
      ack && ack({ ok: true, book: updated });
      socket.emit("books:updated", updated);
      socket.broadcast.emit("books:updated", updated);
    } catch (err) {
      console.error("books:update", err);
      ack && ack({ ok: false, error: "server_error in books:update" });
    }
  });

  socket.on("books:delete", async ({ id }, ack) => {
    audit(socket, "books:delete", { id });
    if (!requireAuth(socket, ack)) return;

    try {
      await Book.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("books:deleted", { id });
      socket.broadcast.emit("books:deleted", { id });
    } catch (err) {
      console.error("books:delete", err);
      ack && ack({ ok: false, error: "server_error in books:delete" });
    }
  });

  socket.on("books:list", async (_, ack) => {
    audit(socket, "books:list", {});
    if (!requireAuth(socket, ack)) return;

    try {
      const books = await Book.findAll({ order: [["created_at", "DESC"]] });
      ack && ack({ ok: true, books });
    } catch (err) {
      console.error("books:list", err);
      ack && ack({ ok: false, error: "server_error in books:list" });
    }
  });

  /******************* 🧩 MICRO LEARNING *******************/
  socket.on("microLearnings:create", async (payload, ack) => {
    audit(socket, "microLearnings:create", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const micro = await MicroLearning.create({
        id: payload.id || uuidv4(),
        topic: payload.topic,
        generated_text: payload.generated_text,
        quiz: payload.quiz || null,
      });

      ack && ack({ ok: true, microLearning: micro });
      socket.emit("microLearnings:created", micro);
      socket.broadcast.emit("microLearnings:created", micro);
    } catch (err) {
      console.error("microLearnings:create", err);
      ack && ack({ ok: false, error: "server_error in microLearnings:create" });
    }
  });

  socket.on("microLearnings:update", async (payload, ack) => {
    audit(socket, "microLearnings:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { id, ...fields } = payload;
      await MicroLearning.update(fields, { where: { id } });
      const updated = await MicroLearning.findByPk(id);
      ack && ack({ ok: true, microLearning: updated });
      socket.emit("microLearnings:updated", updated);
      socket.broadcast.emit("microLearnings:updated", updated);
    } catch (err) {
      console.error("microLearnings:update", err);
      ack && ack({ ok: false, error: "server_error in microLearnings:update" });
    }
  });

  socket.on("microLearnings:delete", async ({ id }, ack) => {
    audit(socket, "microLearnings:delete", { id });
    if (!requireAuth(socket, ack)) return;

    try {
      await MicroLearning.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("microLearnings:deleted", { id });
      socket.broadcast.emit("microLearnings:deleted", { id });
    } catch (err) {
      console.error("microLearnings:delete", err);
      ack && ack({ ok: false, error: "server_error in microLearnings:delete" });
    }
  });

  socket.on("microLearnings:list", async (_, ack) => {
    audit(socket, "microLearnings:list", {});
    if (!requireAuth(socket, ack)) return;

    try {
      const microLearnings = await MicroLearning.findAll({
        order: [["created_at", "DESC"]],
      });
      ack && ack({ ok: true, microLearnings });
    } catch (err) {
      console.error("microLearnings:list", err);
      ack && ack({ ok: false, error: "server_error in microLearnings:list" });
    }
  });

  /******************* 🎥 YOUTUBE VIDEOS *******************/
  socket.on("youtubeVideos:create", async (payload, ack) => {
    audit(socket, "youtubeVideos:create", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const video = await YouTubeVideo.create({
        id: payload.id || uuidv4(),
        title: payload.title,
        url: payload.url,
        tags: payload.tags || [],
      });

      ack && ack({ ok: true, video });
      socket.emit("youtubeVideos:created", video);
      socket.broadcast.emit("youtubeVideos:created", video);
    } catch (err) {
      console.error("youtubeVideos:create", err);
      ack && ack({ ok: false, error: "server_error in youtubeVideos:create" });
    }
  });

  socket.on("youtubeVideos:update", async (payload, ack) => {
    audit(socket, "youtubeVideos:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { id, ...fields } = payload;
      await YouTubeVideo.update(fields, { where: { id } });
      const updated = await YouTubeVideo.findByPk(id);
      ack && ack({ ok: true, video: updated });
      socket.emit("youtubeVideos:updated", updated);
      socket.broadcast.emit("youtubeVideos:updated", updated);
    } catch (err) {
      console.error("youtubeVideos:update", err);
      ack && ack({ ok: false, error: "server_error in youtubeVideos:update" });
    }
  });

  socket.on("youtubeVideos:delete", async ({ id }, ack) => {
    audit(socket, "youtubeVideos:delete", { id });
    if (!requireAuth(socket, ack)) return;

    try {
      await YouTubeVideo.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("youtubeVideos:deleted", { id });
      socket.broadcast.emit("youtubeVideos:deleted", { id });
    } catch (err) {
      console.error("youtubeVideos:delete", err);
      ack && ack({ ok: false, error: "server_error in youtubeVideos:delete" });
    }
  });

  socket.on("youtubeVideos:list", async (_, ack) => {
    audit(socket, "youtubeVideos:list", {});
    if (!requireAuth(socket, ack)) return;

    try {
      const videos = await YouTubeVideo.findAll({
        order: [["created_at", "DESC"]],
      });
      ack && ack({ ok: true, videos });
    } catch (err) {
      console.error("youtubeVideos:list", err);
      ack && ack({ ok: false, error: "server_error in youtubeVideos:list" });
    }
  });

  /* -------------------------
     PODCASTS
  -------------------------*/
  socket.on("podcasts:create", async (payload, ack) => {
    audit(socket, "podcasts:create", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const podcast = await Podcast.create({
        id: payload.id || uuidv4(),
        title: payload.title,
        description: payload.description,
        audio_url: payload.audio_url,
        duration_seconds: payload.duration_seconds,
        tags: payload.tags || [],
      });

      ack && ack({ ok: true, podcast });
      socket.emit("podcasts:created", podcast);
      socket.broadcast.emit("podcasts:created", podcast);
    } catch (err) {
      console.error("podcasts:create", err);
      ack && ack({ ok: false, error: "server_error in podcasts:create" });
    }
  });

  socket.on("podcasts:update", async (payload, ack) => {
    audit(socket, "podcasts:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { id, ...fields } = payload;
      await Podcast.update(fields, { where: { id } });
      const updated = await Podcast.findByPk(id);
      ack && ack({ ok: true, podcast: updated });
      socket.emit("podcasts:updated", updated);
      socket.broadcast.emit("podcasts:updated", updated);
    } catch (err) {
      console.error("podcasts:update", err);
      ack && ack({ ok: false, error: "server_error in podcasts:update" });
    }
  });

  socket.on("podcasts:delete", async ({ id }, ack) => {
    audit(socket, "podcasts:delete", { id });
    if (!requireAuth(socket, ack)) return;

    try {
      await Podcast.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("podcasts:deleted", { id });
      socket.broadcast.emit("podcasts:deleted", { id });
    } catch (err) {
      console.error("podcasts:delete", err);
      ack && ack({ ok: false, error: "server_error in podcasts:delete" });
    }
  });

  socket.on("podcasts:list", async (_, ack) =>
    safeList(Podcast, { order: [["created_at", "DESC"]] }, "podcasts", ack)
  );

  /* -------------------------
     COURSES
  -------------------------*/
  socket.on("courses:create", async (payload, ack) => {
    audit(socket, "courses:create", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const course = await Course.create({
        id: payload.id || uuidv4(),
        title: payload.title,
        summary: payload.summary,
        provider: payload.provider,
        url: payload.url,
        tags: payload.tags || [],
      });

      ack && ack({ ok: true, course });
      socket.emit("courses:created", course);
      socket.broadcast.emit("courses:created", course);
    } catch (err) {
      console.error("courses:create", err);
      ack && ack({ ok: false, error: "server_error in courses:create" });
    }
  });

  socket.on("courses:update", async (payload, ack) => {
    audit(socket, "courses:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { id, ...fields } = payload;
      await Course.update(fields, { where: { id } });
      const updated = await Course.findByPk(id);
      ack && ack({ ok: true, course: updated });
      socket.emit("courses:updated", updated);
      socket.broadcast.emit("courses:updated", updated);
    } catch (err) {
      console.error("courses:update", err);
      ack && ack({ ok: false, error: "server_error in courses:update" });
    }
  });

  socket.on("courses:delete", async ({ id }, ack) => {
    audit(socket, "courses:delete", { id });
    if (!requireAuth(socket, ack)) return;

    try {
      await Course.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("courses:deleted", { id });
      socket.broadcast.emit("courses:deleted", { id });
    } catch (err) {
      console.error("courses:delete", err);
      ack && ack({ ok: false, error: "server_error in courses:delete" });
    }
  });

  socket.on("courses:list", async (_, ack) =>
    safeList(Course, { order: [["created_at", "DESC"]] }, "courses", ack)
  );

  /******************* 🎓 LEARNING ASSIGNMENTS *******************/
  socket.on("courses:create", async (payload, ack) => {
    audit(socket, "courses:create", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const course = await Course.create({
        id: payload.id || uuidv4(),
        title: payload.title,
        summary: payload.summary,
        provider: payload.provider,
        url: payload.url,
        tags: payload.tags || [],
      });

      ack && ack({ ok: true, course });
      socket.emit("courses:created", course);
      socket.broadcast.emit("courses:created", course);
    } catch (err) {
      console.error("courses:create", err);
      ack && ack({ ok: false, error: "server_error in courses:create" });
    }
  });

  socket.on("courses:update", async (payload, ack) => {
    audit(socket, "courses:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { id, ...fields } = payload;
      await Course.update(fields, { where: { id } });
      const updated = await Course.findByPk(id);
      ack && ack({ ok: true, course: updated });
      socket.emit("courses:updated", updated);
      socket.broadcast.emit("courses:updated", updated);
    } catch (err) {
      console.error("courses:update", err);
      ack && ack({ ok: false, error: "server_error in courses:update" });
    }
  });

  socket.on("courses:delete", async ({ id }, ack) => {
    audit(socket, "courses:delete", { id });
    if (!requireAuth(socket, ack)) return;

    try {
      await Course.destroy({ where: { id } });
      ack && ack({ ok: true });
      socket.emit("courses:deleted", { id });
      socket.broadcast.emit("courses:deleted", { id });
    } catch (err) {
      console.error("courses:delete", err);
      ack && ack({ ok: false, error: "server_error in courses:delete" });
    }
  });

  socket.on("courses:list", async (_, ack) =>
    safeList(Course, { order: [["created_at", "DESC"]] }, "courses", ack)
  );

  /* -------------------------
     LEARNING ASSIGNMENTS
  -------------------------*/
  socket.on("listLearningAssignments", async (_, ack) => {
    audit(socket, "listLearningAssignments", {});
    if (!requireAuth(socket, ack)) return;

    try {
      const assignments = await LearningAssignment.findAll({
        include: [
          { model: User, as: "assignee", attributes: ["id", "username"] },
          { model: User, as: "assigner", attributes: ["id", "username"] },
          { model: Book, as: "bookResource", attributes: ["id", "title"] },
          {
            model: MicroLearning,
            as: "microLearningResource",
            attributes: ["id", "topic"],
          },
          {
            model: YouTubeVideo,
            as: "youTubeVideo",
            attributes: ["id", "title"],
          },
          {
            model: Podcast,
            as: "podcastResource",
            attributes: ["id", "title"],
          },
          { model: Course, as: "courseResource", attributes: ["id", "title"] },
        ],
        order: [["assigned_at", "DESC"]],
      });

      ack && ack({ ok: true, assignments });
    } catch (err) {
      console.error("listLearningAssignments", err);
      ack &&
        ack({ ok: false, error: "server_error in listLearningAssignments" });
    }
  });

  socket.on("createLearningAssignment", async (payload, ack) => {
    audit(socket, "createLearningAssignment", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const assignment = await LearningAssignment.create({
        id: payload.id || `la_${Date.now()}`,
        assignee_id: payload.assigneeId,
        assigner_id: socket.user.id,
        resource_id: payload.resourceId,
        resource_type: payload.resourceType,
        assigned_at: new Date(),
        status: payload.status || "ASSIGNED",
        trigger_objective_id: payload.triggerObjectiveId || null,
        trigger_feedback_id: payload.triggerFeedbackId || null,
      });

      const full = await LearningAssignment.findByPk(assignment.id, {
        include: [
          { model: User, as: "assignee", attributes: ["id", "username"] },
          { model: User, as: "assigner", attributes: ["id", "username"] },
          { model: Book, as: "bookResource", attributes: ["id", "title"] },
          {
            model: MicroLearning,
            as: "microLearningResource",
            attributes: ["id", "topic"],
          },
          {
            model: YouTubeVideo,
            as: "youTubeVideo",
            attributes: ["id", "title"],
          },
          {
            model: Podcast,
            as: "podcastResource",
            attributes: ["id", "title"],
          },
          { model: Course, as: "courseResource", attributes: ["id", "title"] },
        ],
      });

      ack && ack({ ok: true, assignment: full });
      socket.emit("learningAssignments:created", full);
      socket.broadcast.emit("learningAssignments:created", full);
    } catch (err) {
      console.error("createLearningAssignment", err);
      ack &&
        ack({ ok: false, error: "server_error in createLearningAssignment" });
    }
  });

  socket.on("learningAssignments:update", async (payload, ack) => {
    audit(socket, "learningAssignments:update", payload);
    if (!requireAuth(socket, ack)) return;

    try {
      const { assignmentId, fields } = payload;
      const assignment = await LearningAssignment.findByPk(assignmentId);
      if (!assignment) return ack && ack({ ok: false, error: "not_found" });

      await assignment.update(fields);

      const full = await LearningAssignment.findByPk(assignmentId, {
        include: [
          { model: User, as: "assignee", attributes: ["id", "username"] },
          { model: User, as: "assigner", attributes: ["id", "username"] },
          { model: Book, as: "bookResource", attributes: ["id", "title"] },
          {
            model: MicroLearning,
            as: "microLearningResource",
            attributes: ["id", "topic"],
          },
          {
            model: YouTubeVideo,
            as: "youTubeVideo",
            attributes: ["id", "title"],
          },
          {
            model: Podcast,
            as: "podcastResource",
            attributes: ["id", "title"],
          },
          { model: Course, as: "courseResource", attributes: ["id", "title"] },
        ],
      });

      ack && ack({ ok: true, assignment: full });
      socket.emit("learningAssignments:updated", full);
      socket.broadcast.emit("learningAssignments:updated", full);
    } catch (err) {
      console.error("learningAssignments:update", err);
      ack &&
        ack({ ok: false, error: "server_error in learningAssignments:update" });
    }
  });
};

/*
const LearningAssignment = require("../../models/learningAssignment");
const { audit } = require("../../middleware/audit");

module.exports = function learning(socket) {
    socket.on('listLearningAssignments', async (_, ack) => {
      audit(socket, "listLearningAssignments", data);
      if (!requireAuth(socket, ack)) return;
    
      try {
        const assignments = await LearningAssignment.findAll({
          // include: ['assignee', 'assigner', 'bookResource', 'microLearningResource'],
          include: [
            { model: models.User, as: 'assignee', attributes: ['id', 'username'] },
            { model: models.User, as: 'assigner', attributes: ['id', 'username'] },
            { model: models.Book, as: 'book', attributes: ['id', 'title'] },
            { model: models.MicroLearning, as: 'microLearning', attributes: ['id', 'title'] },
            { model: models.YouTubeVideo, as: 'youTubeVideo', attributes: ['id', 'title'] }
          ],
          order: [['assigned_at', 'DESC']]
        });
    
        ack && ack({ ok: true, assignments });
      } catch (err) {
        console.error('listLearningAssignments', err);
        ack && ack({ ok: false, error: 'server_error in listLearningAssignments' });
      }
    });

    // *******************Learning Assignment ******************* 
  socket.on('createLearningAssignment', async (payload, ack) => {
    audit(socket, 'createLearningAssignment', payload);
    //requireAuth(socket, ack) ensures only logged-in users can create/update/list assignments.
    if (!requireAuth(socket, ack)) return;
  
    try {
      const {
        assigneeId,
        resourceId,
        resourceType,
        status = 'ASSIGNED',
        triggerObjectiveId,
        triggerFeedbackId
      } = payload;
  
      const assignment = await LearningAssignment.create({
        id: `la_${Date.now()}`, // simple ID generation
        assignee_id: assigneeId,
        assigner_id: socket.user.id,
        resource_id: resourceId,
        resource_type: resourceType,
        assigned_at: new Date(),
        status,
        trigger_objective_id: triggerObjectiveId || null,
        trigger_feedback_id: triggerFeedbackId || null
      });
  
      const full = await LearningAssignment.findByPk(assignment.id, {
        include: ['assignee', 'assigner', 'bookResource', 'microLearningResource']
      });
  
      ack && ack({ ok: true, assignment: full });
      // io.emit('learningAssignmentCreated', full); // broadcast
      socket.emit('learningAssignmentCreated', full);
      socket.broadcast.emit('learningAssignmentCreated', full);
    } catch (err) {
      console.error('createLearningAssignment', err);
      ack && ack({ ok: false, error: 'server_error in createLearningAssignment' });
    }
  });

    
    socket.on('learningAssignments:update', async (payload, ack) => {
      audit(socket, 'learningAssignments:update', payload);
      if (!requireAuth(socket, ack)) return;
    
      try {
        const { assignmentId, fields } = payload;
        const assignment = await LearningAssignment.findByPk(assignmentId);
    
        if (!assignment) return ack && ack({ ok: false, error: 'not_found' });
    
        await assignment.update(fields);
    
        const full = await LearningAssignment.findByPk(assignmentId, {
          include: ['assignee', 'assigner', 'bookResource', 'microLearningResource']
        });
    
        ack && ack({ ok: true, assignment: full });
        // io.emit('learningAssignmentUpdated', full);
        socket.emit("learningAssignments:updated", full);
        socket.broadcast.emit("learningAssignments:updated", full);
      } catch (err) {
        console.error('updateLearningAssignment', err);
        ack && ack({ ok: false, error: 'server_error in updateLearningAssignment' });
      }
    });
};
  
*/

/*
socket.on("learningAssignments:update", async (data) => {
      audit(socket, "learningAssignments:update", data);
      // Placeholder — implement LearningAssignment model
      const updated = { ...data };/////////////////////!!!!!!!!!!!!!!!!!!!!!
      socket.emit("learningAssignments:updated", updated);
      socket.broadcast.emit("learningAssignments:updated", updated);
    });


*/
