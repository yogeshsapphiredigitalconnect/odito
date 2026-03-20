const express = require('express');
const { ObjectId } = require('mongodb');

class PDFReportController {
    constructor(db) {
        this.db = db;
        this.collections = {
            projects: db.collection('seoprojects'),
            issues: db.collection('seo_page_issues'),
            technical: db.collection('domain_technical_reports')
        };
    }

    async getPDFReport(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!ObjectId.isValid(projectId)) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }

            // Get project data
            const project = await this.collections.projects.findOne({ _id: new ObjectId(projectId) });
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Aggregate issue counts by severity
            const issueAggregation = await this.collections.projects.aggregate([
                { $match: { _id: new ObjectId(projectId) } },
                {
                    $lookup: {
                        from: 'seo_page_issues',
                        localField: '_id',
                        foreignField: 'projectId',
                        as: 'issues'
                    }
                },
                { $unwind: '$issues' },
                {
                    $group: {
                        _id: '$issues.severity',
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        issues: {
                            $push: {
                                severity: '$_id',
                                count: '$count'
                            }
                        },
                        total: { $sum: '$count' }
                    }
                }
            ]).toArray();

            // Parse issue counts
            const issueData = issueAggregation[0] || { issues: [], total: 0 };
            const issuesBySeverity = {};
            issueData.issues.forEach(issue => {
                issuesBySeverity[issue.severity] = issue.count;
            });

            // Get technical data
            const technicalReport = await this.collections.technical.findOne({ projectId: new ObjectId(projectId) });

            // Compute checks passed
            const pagesCrawled = project.pages_crawled || 0;
            const totalIssues = issueData.total || 0;
            const checksPassed = Math.max(0, pagesCrawled - totalIssues);

            // Build structured response
            const reportData = {
                cover: this.buildCoverData(project, issuesBySeverity, checksPassed),
                executiveSummary: this.buildExecutiveSummaryData(project, issuesBySeverity, checksPassed),
                strengths: this.buildStrengthsData(technicalReport),
                seoHealth: this.buildSEOHealthData(project),
                onPage: this.buildOnPageData(project, issuesBySeverity)
            };

            res.json(reportData);

        } catch (error) {
            console.error('PDF Report API Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    buildCoverData(project, issuesBySeverity, checksPassed) {
        const data = {
            // Only include fields that exist in seoprojects
            domain: project.main_url || null,
            companyName: project.project_name || null,
            auditDate: project.last_analysis_at || null,
            pagesCrawled: project.pages_crawled || 0,
            totalIssues: project.total_issues || 0,
            // Available scores
            seoHealth: project.website_score || 0,
            aiVisibility: project.ai_visibility?.score || 0,
            websiteGrade: project.website_grade || null,
            // Issue breakdown
            criticalIssues: issuesBySeverity.critical || 0,
            warnings: issuesBySeverity.warning || 0,
            informational: issuesBySeverity.info || 0,
            checksPassed: checksPassed
        };

        // Remove null/undefined values
        return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== undefined));
    }

    buildExecutiveSummaryData(project, issuesBySeverity, checksPassed) {
        const data = {
            // Available scores
            seoHealth: project.website_score || 0,
            aiVisibility: project.ai_visibility?.score || 0,
            // Issue breakdown
            criticalIssues: issuesBySeverity.critical || 0,
            warnings: issuesBySeverity.warning || 0,
            informational: issuesBySeverity.info || 0,
            checksPassed: checksPassed,
            // Totals
            pagesCrawled: project.pages_crawled || 0,
            totalIssues: project.total_issues || 0,
            // AI analysis summary if available
            aiAnalysisSummary: project.ai_visibility?.summary || null
        };

        return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== undefined));
    }

    buildStrengthsData(technicalReport) {
        if (!technicalReport) {
            return {};
        }

        const data = {
            // Only include available technical checks
            sslValid: technicalReport.sslValid || null,
            httpsRedirect: technicalReport.httpsRedirect || null,
            robotsExists: technicalReport.robotsExists || null,
            sitemapExists: technicalReport.sitemapExists || null,
            sitemapUrls: technicalReport.parsedSitemapUrlCount || null,
            sslDaysRemaining: technicalReport.sslDaysRemaining || null
        };

        return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== undefined));
    }

    buildSEOHealthData(project) {
        const data = {
            // Only available scores
            seoHealth: project.website_score || 0,
            aiVisibility: project.ai_visibility?.score || 0,
            websiteGrade: project.website_grade || null
        };

        return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== undefined));
    }

    buildOnPageData(project, issuesBySeverity) {
        const data = {
            // Available totals
            totalIssues: project.total_issues || 0,
            pagesCrawled: project.pages_crawled || 0,
            // Severity breakdown
            criticalIssues: issuesBySeverity.critical || 0,
            highIssues: issuesBySeverity.high || 0,
            mediumIssues: issuesBySeverity.medium || 0,
            lowIssues: issuesBySeverity.low || 0
        };

        return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== undefined));
    }
}

module.exports = PDFReportController;
