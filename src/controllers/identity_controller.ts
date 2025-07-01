import { Request, Response } from 'express';
import { dataSource } from '../dbconfig';
import { Contact } from '../entity/Contact';

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate input
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: 'Email or phoneNumber is required',
      });
    }

    const contactRepo = await dataSource.getRepository(Contact);

    // Find all contacts that match the email or phone
    const matchingContacts = await contactRepo.find({
      where: [{ email }, { phoneNumber }],
      relations: ['linkedId'],
    });

    // If no matches, create a new primary contact
    if (matchingContacts.length === 0) {
      return await createNewPrimaryContact(
        contactRepo,
        email,
        phoneNumber,
        res
      );
    }

    // Get all contacts in the cluster (primary + all linked secondaries)
    const allContactsInCluster = await getAllContactsInCluster(
      contactRepo,
      matchingContacts
    );

    // Find the oldest primary contact (this will be our main primary)
    const oldestPrimary = findOldestPrimary(allContactsInCluster);

    // Convert any newer primaries to secondaries
    await convertNewPrimariesToSecondaries(
      contactRepo,
      allContactsInCluster,
      oldestPrimary
    );

    // Add new secondary contact if email/phone is new to cluster
    const updatedContacts = await addNewSecondaryIfNeeded(
      contactRepo,
      allContactsInCluster,
      email,
      phoneNumber,
      oldestPrimary
    );

    // Build and return response
    return res.json(buildResponse(updatedContacts, oldestPrimary));
  } catch (error) {
    console.error('Error in identify:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to create a new primary contact
async function createNewPrimaryContact(
  repo: any,
  email: string,
  phoneNumber: string,
  res: Response
) {
  const newContact = repo.create({
    email,
    phoneNumber,
    linkPrecedence: 'primary',
  });

  await repo.save(newContact);

  return res.json({
    contact: {
      primaryContactId: newContact.id,
      emails: email ? [email] : [],
      phoneNumbers: phoneNumber ? [phoneNumber] : [],
      secondaryContactIds: [],
    },
  });
}

// Helper function to get all contacts in a cluster
async function getAllContactsInCluster(repo: any, initialMatches: Contact[]) {
  console.log('Initial matches:', initialMatches);
  const allContacts: Contact[] = [];
  const processedIds = new Set<number>();

  for (const contact of initialMatches) {
    // Find the primary contact for this match
    const primary =
      contact.linkPrecedence === 'primary' ? contact : contact.linkedId;

    if (!primary || primary.id === undefined || processedIds.has(primary.id)) {
      continue;
    }

    processedIds.add(primary.id);

    // Get all secondary contacts linked to this primary
    const secondaryContacts = await repo.find({
      where: { linkedId: primary },
    });

    allContacts.push(primary, ...secondaryContacts);
  }

  return allContacts;
}

// Helper function to find the oldest primary contact
function findOldestPrimary(contacts: Contact[]) {
  const primaries = contacts.filter((c) => c.linkPrecedence === 'primary');

  return primaries.sort((a, b) => {
    const timeA = a.createdAt ? a.createdAt.getTime() : 0;
    const timeB = b.createdAt ? b.createdAt.getTime() : 0;
    return timeA - timeB;
  })[0];
}

// Helper function to convert newer primaries to secondaries
async function convertNewPrimariesToSecondaries(
  repo: any,
  allContacts: Contact[],
  oldestPrimary: Contact
) {
  const primaries = allContacts.filter((c) => c.linkPrecedence === 'primary');
  console.log('Oldest primary:', oldestPrimary);

  // Convert all primaries except the oldest to secondaries
  for (const primary of primaries) {
    if (primary.id !== oldestPrimary.id) {
      primary.linkPrecedence = 'secondary';
      primary.linkedId = oldestPrimary;
      await repo.save(primary);

      // Update any contacts that were linked to this primary
      const linkedContacts = await repo.find({
        where: { linkedId: primary },
      });

      for (const linked of linkedContacts) {
        linked.linkedId = oldestPrimary;
        await repo.save(linked);
      }
    }
  }
}

// Helper function to add new secondary contact if needed
async function addNewSecondaryIfNeeded(
  repo: any,
  allContacts: Contact[],
  email: string,
  phoneNumber: string,
  oldestPrimary: Contact
) {
  // Get all unique emails and phone numbers in the cluster
  const existingEmails = new Set(
    allContacts.map((c) => c.email).filter((e) => e !== null && e !== undefined)
  );

  const existingPhones = new Set(
    allContacts
      .map((c) => c.phoneNumber)
      .filter((p) => p !== null && p !== undefined)
  );

  // Check if we need to add a new secondary contact
  const needNewSecondary =
    (email && !existingEmails.has(email)) ||
    (phoneNumber && !existingPhones.has(phoneNumber));

  if (needNewSecondary) {
    const newSecondary = repo.create({
      email,
      phoneNumber,
      linkPrecedence: 'secondary',
      linkedId: oldestPrimary,
    });

    await repo.save(newSecondary);
    allContacts.push(newSecondary);
  }

  return allContacts;
}

// Helper function to build the response
function buildResponse(allContacts: Contact[], oldestPrimary: Contact) {
  // Get unique emails and phone numbers
  const emails = [
    ...new Set(
      allContacts
        .map((c) => c.email)
        .filter((e) => e !== null && e !== undefined)
    ),
  ];

  const phoneNumbers = [
    ...new Set(
      allContacts
        .map((c) => c.phoneNumber)
        .filter((p) => p !== null && p !== undefined)
    ),
  ];

  // Get secondary contact IDs
  const secondaryContactIds = allContacts
    .filter((c) => c.linkPrecedence === 'secondary')
    .map((c) => c.id);

  return {
    contact: {
      primaryContactId: oldestPrimary.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
}
