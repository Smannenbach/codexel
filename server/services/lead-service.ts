import { db } from '../db';
import { siteLeads, sites } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

interface LeadPayload {
  siteId: number;
  name: string;
  email: string;
  phone?: string;
  loanAmount?: number;
  propertyValue?: number;
  state?: string;
  loanType?: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata?: Record<string, unknown>;
}

interface LeadResult {
  id: number;
  ghlContactId?: string;
  success: boolean;
  message: string;
}

interface LeadStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  conversionRate: number;
}

export class LeadService {
  async captureLead(payload: LeadPayload): Promise<LeadResult> {
    const [lead] = await db.insert(siteLeads).values({
      siteId: payload.siteId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      loanAmount: payload.loanAmount,
      propertyValue: payload.propertyValue,
      state: payload.state,
      loanType: payload.loanType,
      message: payload.message,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
      status: 'new',
      metadata: payload.metadata ?? {},
    }).returning();

    // Increment site lead count
    await db.update(sites)
      .set({ leadCount: sql`${sites.leadCount} + 1`, updatedAt: new Date() })
      .where(eq(sites.id, payload.siteId));

    // Fire-and-forget GHL sync
    let ghlContactId: string | undefined;
    const ghlId = await this.syncToGoHighLevel(payload, lead.id);
    if (ghlId) {
      ghlContactId = ghlId;
    }

    return { id: lead.id, ghlContactId, success: true, message: 'Lead captured successfully' };
  }

  async syncToGoHighLevel(lead: LeadPayload, leadId: number): Promise<string | null> {
    const apiKey = process.env.GHL_API_KEY;
    if (!apiKey) {
      console.warn('[LeadService] GHL_API_KEY not set — skipping CRM sync for lead', leadId);
      return null;
    }

    try {
      const [firstName, ...rest] = lead.name.trim().split(' ');
      const lastName = rest.join(' ') || '';

      const body = {
        firstName,
        lastName,
        email: lead.email,
        phone: lead.phone,
        source: 'Codexel Site',
        customField: [
          { id: 'loan_type', value: lead.loanType ?? '' },
          { id: 'loan_amount', value: String(lead.loanAmount ?? '') },
          { id: 'property_state', value: lead.state ?? '' },
          { id: 'utm_source', value: lead.utmSource ?? '' },
          { id: 'utm_campaign', value: lead.utmCampaign ?? '' },
        ],
        tags: ['codexel', lead.loanType ?? 'mortgage'].filter(Boolean),
      };

      const res = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error('[LeadService] GHL sync failed:', res.status, await res.text());
        return null;
      }

      const data = await res.json() as { contact?: { id?: string } };
      return data?.contact?.id ?? null;
    } catch (err) {
      console.error('[LeadService] GHL sync error:', err);
      return null;
    }
  }

  async getLeadsForSite(siteId: number, limit = 100): Promise<typeof siteLeads.$inferSelect[]> {
    return db.select().from(siteLeads)
      .where(eq(siteLeads.siteId, siteId))
      .orderBy(desc(siteLeads.createdAt))
      .limit(limit);
  }

  async getLeadStats(siteId: number): Promise<LeadStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalRow] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(siteLeads)
      .where(eq(siteLeads.siteId, siteId));

    const [weekRow] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(siteLeads)
      .where(and(eq(siteLeads.siteId, siteId), gte(siteLeads.createdAt, weekAgo)));

    const [monthRow] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(siteLeads)
      .where(and(eq(siteLeads.siteId, siteId), gte(siteLeads.createdAt, monthAgo)));

    return {
      total: totalRow?.count ?? 0,
      thisWeek: weekRow?.count ?? 0,
      thisMonth: monthRow?.count ?? 0,
      conversionRate: 0, // Requires visitor tracking — placeholder
    };
  }

  async enrichLead(leadId: number): Promise<void> {
    console.log(`[LeadService] Enrichment queued for lead ${leadId}`);
  }
}

export const leadService = new LeadService();
