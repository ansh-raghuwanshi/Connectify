import { Event } from "../model/event.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, eventLink, bannerUrl, capacity, category } =
    req.body;

  if (!title || !description || !date) {
    throw new apiError(400, "Title, description, and event date are required");
  }

  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    date: new Date(date),
    location: location ? location.trim() : "Online",
    eventLink: eventLink ? eventLink.trim() : "",
    bannerUrl: bannerUrl || "",
    capacity: capacity ? parseInt(capacity, 10) : 100,
    category: category || "General",
    organizer: req.user._id,
  });

  const populatedEvent = await Event.findById(event._id).populate(
    "organizer",
    "name role profilePicture currentCompany jobTitle"
  );

  return res
    .status(201)
    .json(new apiResponse(201, "Event created successfully", populatedEvent));
});

const getEvents = asyncHandler(async (req, res) => {
  const { category, upcoming, page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (category) filter.category = category;
  if (upcoming === "true") {
    filter.date = { $gte: new Date() };
  }

  const [total, events] = await Promise.all([
    Event.countDocuments(filter),
    Event.find(filter)
      .populate("organizer", "name role profilePicture currentCompany jobTitle")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const formattedEvents = events.map((event) => ({
    ...event,
    attendeesCount: event.attendees ? event.attendees.length : 0,
    isRegistered: req.user
      ? event.attendees.some((id) => id.toString() === req.user._id.toString())
      : false,
  }));

  return res.status(200).json({
    success: true,
    message: "Events retrieved successfully",
    data: formattedEvents,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).populate(
    "organizer",
    "name role profilePicture currentCompany jobTitle"
  );

  if (!event) {
    throw new apiError(404, "Event not found");
  }

  const eventObj = event.toObject();
  eventObj.attendeesCount = event.attendees.length;
  eventObj.isRegistered = req.user
    ? event.attendees.some((attId) => attId.toString() === req.user._id.toString())
    : false;

  return res.status(200).json(new apiResponse(200, "Event retrieved successfully", eventObj));
});

const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(id);
  if (!event) {
    throw new apiError(404, "Event not found");
  }

  const isAlreadyRegistered = event.attendees.some(
    (attId) => attId.toString() === userId.toString()
  );

  if (isAlreadyRegistered) {
    event.attendees = event.attendees.filter(
      (attId) => attId.toString() !== userId.toString()
    );
    await event.save();
    return res.status(200).json(
      new apiResponse(200, "Successfully unregistered from event", {
        registered: false,
        attendeesCount: event.attendees.length,
      })
    );
  }

  if (event.attendees.length >= event.capacity) {
    throw new apiError(400, "Event capacity has been reached");
  }

  event.attendees.push(userId);
  await event.save();

  return res.status(200).json(
    new apiResponse(200, "Successfully registered for event", {
      registered: true,
      attendeesCount: event.attendees.length,
    })
  );
});

export { createEvent, getEvents, getEventById, registerForEvent };
