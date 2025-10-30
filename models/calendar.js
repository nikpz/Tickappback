// models/CalendarEvent.js
module.exports = (sequelize, DataTypes) => {
    const CalendarEvent = sequelize.define(
      "CalendarEvent",
      {
        id: {
          type: DataTypes.TEXT,
          allowNull: false,
          primaryKey: true,
        },
        title: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        start: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        recurrence: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {
            frequency: "none",
            interval: 1,
          },
        },
        color: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: "#4F46E5",
        },
        created_by: {
          type: DataTypes.TEXT,
          allowNull: true,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
      },
      {
        tableName: "calendar_events",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true, // enables soft-deletes
        timestamps: true,
      }
    );
  
    CalendarEvent.associate = (models) => {
      CalendarEvent.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });
    };
  
    return CalendarEvent;
  };
  











/*// models/calendar.js
const { v4: uuidv4 } = require("uuid");
const { calendarEvents } = require("../models");

// let calendarEvents = []; // in-memory; replace with DB later

function listCalendarEvents() {
  return calendarEvents;
}

function createCalendarEvent(event) {
  const newEvent = { id: uuidv4(), ...event, createdAt: Date.now() };
  calendarEvents.push(newEvent);
  return newEvent;
}

function updateCalendarEvent(updated) {
  calendarEvents = calendarEvents.map((e) =>
    e.id === updated.id ? { ...e, ...updated } : e
  );
  return updated;
}

function deleteCalendarEvent(id) {
  calendarEvents = calendarEvents.filter((e) => e.id !== id);
  return { id };
}

module.exports = {
  listCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
};
*/