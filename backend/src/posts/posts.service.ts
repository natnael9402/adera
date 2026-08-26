import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreatePostDto, 
  UpdatePostStatusDto, 
  ActivatePostDto, 
  DonateToPostDto, 
  AddPostUpdateDto 
} from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto, authorId: number, status: 'PENDING' | 'APPROVED' = 'PENDING') {
    return this.prisma.post.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        image: dto.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
        goal: parseFloat(dto.goal.toString()),
        raised: dto.raised !== undefined ? parseFloat(dto.raised.toString()) : 0.0,
        donationsCount: dto.raised && parseFloat(dto.raised.toString()) > 0 ? 1 : 0,
        category: dto.category || 'Humanitarian',
        urgency: dto.urgency || 'Featured',
        status,
        activationStatus: status === 'APPROVED' ? 'ACTIVE' : 'PENDING_DEPOSIT',
        activationDepositFee: 5.0,
        cryptoPayoutAddress: dto.cryptoPayoutAddress || '',
        cryptoPayoutSymbol: dto.cryptoPayoutSymbol || 'USDC',
        beneficiary: dto.beneficiary || 'Local Humanitarian Beneficiaries',
        location: dto.location || 'Global',
        verifiedBadge: true,
        impactMilestones: dto.impactMilestones || [
          { target: parseFloat(dto.goal.toString()) * 0.25, title: 'Phase 1: Initial Deployment & Supplies', completed: false },
          { target: parseFloat(dto.goal.toString()) * 0.75, title: 'Phase 2: Direct Community Distribution', completed: false },
          { target: parseFloat(dto.goal.toString()), title: 'Phase 3: Final Goal Achieved & Verified Audit', completed: false },
        ],
        updates: [],
        authorId,
      },
    });
  }

  async activate(id: number, authorId: number, dto: ActivatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Cause campaign not found');
    if (post.authorId !== authorId) throw new BadRequestException('Unauthorized to submit payment proof for this cause');

    return this.prisma.post.update({
      where: { id },
      data: {
        activationStatus: 'PENDING_REVIEW', // Awaiting Admin verification of the $5 payment proof
        status: 'PENDING',
        activationTxHash: dto.txHash || null,
        paymentProofImage: dto.paymentProofImage || null,
        paymentMethodSymbol: dto.cryptoSymbol || 'BTC',
        activationDepositFee: dto.depositAmount ? parseFloat(dto.depositAmount.toString()) : 5.0,
      },
    });
  }

  async donate(id: number, dto: DonateToPostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Cause not found');

    const amountUsd = parseFloat(dto.amountUsd.toString());
    const donorName = dto.isAnonymous ? 'Anonymous Supporter' : (dto.donorName?.trim() || 'Generous Donor');

    // 1. Create DirectDonation record
    const donation = await this.prisma.directDonation.create({
      data: {
        causeId: id,
        donorName,
        donorEmail: dto.donorEmail || null,
        amountUsd,
        cryptoAmount: dto.cryptoAmount,
        cryptoSymbol: dto.cryptoSymbol,
        txHash: dto.txHash,
        message: dto.message || null,
        isAnonymous: dto.isAnonymous || false,
        status: 'CONFIRMED',
      },
    });

    // 2. Increment cause raised and donationsCount
    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        raised: { increment: amountUsd },
        donationsCount: { increment: 1 },
      },
    });

    // 3. Add entry to Donor Wall
    try {
      await this.prisma.donor.create({
        data: {
          name: donorName,
          amount: amountUsd,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          avatar: `preset:${dto.cryptoSymbol.toLowerCase()}`,
          title: `Supported: ${post.title.slice(0, 30)}...`,
          badge: `${dto.cryptoSymbol} Verified`,
        },
      });
    } catch (e) {
      // Ignore donor wall duplicate errors
    }

    return {
      message: 'Donation processed successfully!',
      donation,
      post: updatedPost,
    };
  }

  async getDonations(id: number) {
    return this.prisma.directDonation.findMany({
      where: { causeId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addUpdate(id: number, authorId: number, dto: AddPostUpdateDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Cause not found');
    if (post.authorId !== authorId) throw new BadRequestException('Unauthorized');

    const existingUpdates = Array.isArray(post.updates) ? (post.updates as any[]) : [];
    const newUpdate = {
      id: Date.now(),
      title: dto.title,
      content: dto.content,
      image: dto.image || null,
      date: new Date().toISOString(),
    };

    return this.prisma.post.update({
      where: { id },
      data: {
        updates: [newUpdate, ...existingUpdates],
      },
    });
  }

  async findAllApproved() {
    return this.prisma.post.findMany({
      where: {
        OR: [
          { status: 'APPROVED' },
          { activationStatus: 'ACTIVE' },
        ],
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        directDonations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.prisma.post.findMany({
      where,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAuthor(authorId: number) {
    return this.prisma.post.findMany({
      where: { authorId },
      include: {
        directDonations: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        directDonations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!post) throw new NotFoundException('Cause not found');
    return post;
  }

  async updateStatus(id: number, dto: UpdatePostStatusDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.post.update({
      where: { id },
      data: { 
        status: dto.status,
        activationStatus: dto.status === 'APPROVED' ? 'ACTIVE' : 'PAUSED',
      },
    });
  }

  async adminUpdate(id: number, dto: any) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.description !== undefined) updateData.description = dto.description.trim();
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.urgency !== undefined) updateData.urgency = dto.urgency;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.beneficiary !== undefined) updateData.beneficiary = dto.beneficiary;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.activationStatus !== undefined) updateData.activationStatus = dto.activationStatus;
    if (dto.paymentProofImage !== undefined) updateData.paymentProofImage = dto.paymentProofImage;
    if (dto.activationTxHash !== undefined) updateData.activationTxHash = dto.activationTxHash;
    if (dto.paymentMethodSymbol !== undefined) updateData.paymentMethodSymbol = dto.paymentMethodSymbol;
    if (dto.cryptoPayoutAddress !== undefined) updateData.cryptoPayoutAddress = dto.cryptoPayoutAddress;
    if (dto.cryptoPayoutSymbol !== undefined) updateData.cryptoPayoutSymbol = dto.cryptoPayoutSymbol;
    
    if (dto.goal !== undefined) {
      updateData.goal = parseFloat(dto.goal.toString());
    }
    if (dto.raised !== undefined) {
      updateData.raised = parseFloat(dto.raised.toString());
    }
    if (dto.activationDepositFee !== undefined) {
      updateData.activationDepositFee = parseFloat(dto.activationDepositFee.toString());
    }

    return this.prisma.post.update({
      where: { id },
      data: updateData,
    });
  }

  async generateCauseDescription(dto: any) {
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-a036d02ce19a445f87c1277f2472bed1';

    const systemPrompt = `You are a world-class humanitarian storytelling expert and master copywriter for high-impact philanthropic and blockchain-verified charitable organizations.
Your mission is to write an emotionally engaging, authentic, transparent, and compelling campaign description for a humanitarian cause.

Guidelines:
1. Write 3-4 structured, impactful sections with clear headings:
   - 🎯 The Mission & Immediate Challenge (Provide context, the human urgency, and the communities affected)
   - 🛠️ Direct Action & Deployment Plan (How funds will be used with tangible milestones)
   - 💫 Measurable Impact & Transparency (Number of lives transformed, sustainable outcomes, and verified on-chain accountability)
2. Use compelling, inspiring, and dignified language that respects beneficiaries.
3. Keep the length optimal: around 200-350 words (comprehensive enough to build immense trust, yet concise and punchy for high conversion).
4. Use bullet points for milestones or deliverables where appropriate.
5. Do NOT include markdown code blocks or meta commentary. Return only the formatted cause story ready for publication.`;

    const userPrompt = `Please write a top-tier cause description for the following initiative:
- Cause Title: ${dto.title}
- Category: ${dto.category || 'Humanitarian Aid'}
- Target Funding Goal: $${dto.goal || 25000} USD
- Beneficiaries: ${dto.beneficiary || 'Vulnerable community members & local families'}
- Location: ${dto.location || 'Horn of Africa / East Africa'}
- Urgency Level: ${dto.urgency || 'Featured'}
- Tone: ${dto.tone || 'Inspiring, transparent, and urgent'}
${dto.additionalDetails ? `- Key Details / Notes from Field: ${dto.additionalDetails}` : ''}`;

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new BadRequestException(`DeepSeek API returned error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || '';
      return {
        description: generatedText.trim(),
        model: 'deepseek-chat',
        tokens: data.usage?.total_tokens || 0,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Failed to communicate with DeepSeek AI: ${err.message}`);
    }
  }

  async getStats() {
    const [totalPosts, pendingPosts, approvedPosts, totalDonations, totalRaised] =
      await Promise.all([
        this.prisma.post.count(),
        this.prisma.post.count({ where: { status: 'PENDING' } }),
        this.prisma.post.count({ where: { status: 'APPROVED' } }),
        this.prisma.directDonation.count(),
        this.prisma.directDonation.aggregate({ _sum: { amountUsd: true } }),
      ]);
    return { 
      totalPosts, 
      pendingPosts, 
      approvedPosts, 
      totalDonations, 
      totalRaised: totalRaised._sum.amountUsd || 0.0 
    };
  }
}
