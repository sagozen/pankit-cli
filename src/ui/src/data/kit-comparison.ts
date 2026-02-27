/**
 * Kit comparison data structures for onboarding and feature comparison
 * Uses translation keys for all user-facing strings
 */

export type KitType = "community" | "pro";

export interface KitFeature {
	id: string;
	name: string; // Translation key: e.g., "featureAgents"
	description: string; // Translation key
	community: boolean;
	pro: boolean;
}

export interface KitComparison {
	id: KitType;
	name: string; // Translation key
	tagline: string; // Translation key
	primaryColor: string; // Tailwind color class
	features: string[]; // Feature IDs included
}

export const KIT_FEATURES: KitFeature[] = [
	{
		id: "communitySupport",
		name: "featureCommunitySupport",
		description: "featureCommunitySupportDesc",
		community: true,
		pro: true,
	},
	{
		id: "fullSkills",
		name: "featureFullSkills",
		description: "featureFullSkillsDesc",
		community: true,
		pro: true,
	},
	{
		id: "powerfulCapabilities",
		name: "featurePowerfulCapabilities",
		description: "featurePowerfulCapabilitiesDesc",
		community: true,
		pro: true,
	},
	{
		id: "privateSupportGroup",
		name: "featurePrivateSupportGroup",
		description: "featurePrivateSupportGroupDesc",
		community: false,
		pro: true,
	},
	{
		id: "privateCourse",
		name: "featurePrivateCourse",
		description: "featurePrivateCourseDesc",
		community: false,
		pro: true,
	},
	{
		id: "latestTips",
		name: "featureLatestTips",
		description: "featureLatestTipsDesc",
		community: false,
		pro: true,
	},
	{
		id: "jobs",
		name: "featureJobs",
		description: "featureJobsDesc",
		community: false,
		pro: true,
	},
];

export const KIT_COMPARISONS: Record<KitType, KitComparison> = {
	community: {
		id: "community",
		name: "kitCommunityName",
		tagline: "kitCommunityTagline",
		primaryColor: "text-blue-500",
		features: ["communitySupport", "fullSkills", "powerfulCapabilities"],
	},
	pro: {
		id: "pro",
		name: "kitProName",
		tagline: "kitProTagline",
		primaryColor: "text-purple-500",
		features: [
			"communitySupport",
			"fullSkills",
			"powerfulCapabilities",
			"privateSupportGroup",
			"privateCourse",
			"latestTips",
			"jobs",
		],
	},
};

export function getKitFeatures(kit: KitType): KitFeature[] {
	const comparison = KIT_COMPARISONS[kit];
	if (!comparison) {
		console.warn(`Unknown kit type: ${kit}`);
		return [];
	}
	return KIT_FEATURES.filter((f) => comparison.features.includes(f.id));
}
