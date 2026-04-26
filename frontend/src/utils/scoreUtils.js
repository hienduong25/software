/**
 * Tính matching score giữa candidate và job
 * @param {Object} candidate - Thông tin candidate
 * @param {Object} job - Thông tin công việc
 * @returns {number} Matching score (0-100)
 */
export function calculateMatchingScore(candidate, job) {
  let score = 0;
  let totalWeight = 0;

  // 1. Matching kỹ năng (weight: 40%)
  const skillMatch = calculateSkillMatch(
    candidate.skills || [],
    job.skills || [],
  );
  score += skillMatch * 0.4;
  totalWeight += 0.4;

  // 2. Matching kinh nghiệm (weight: 30%)
  const experienceMatch = calculateExperienceMatch(
    candidate.experience || 0,
    job.experience || "",
  );
  score += experienceMatch * 0.3;
  totalWeight += 0.3;

  // 3. Matching học vấn (weight: 15%)
  const educationMatch = calculateEducationMatch(
    candidate.education || "",
    job.education || "",
  );
  score += educationMatch * 0.15;
  totalWeight += 0.15;

  // 4. Matching vị trí/ngành (weight: 15%)
  const positionMatch = calculatePositionMatch(
    candidate.title || "",
    job.title || "",
  );
  score += positionMatch * 0.15;
  totalWeight += 0.15;

  return Math.round(score / totalWeight);
}

/**
 * Tính matching percentage của skills
 */
export function calculateSkillMatch(candidateSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 100;

  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkills.some(
      (cs) =>
        cs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(cs.toLowerCase()),
    ),
  );

  return Math.round((matchedSkills.length / jobSkills.length) * 100);
}

/**
 * Tính matching dựa trên kinh nghiệm (năm)
 */
export function calculateExperienceMatch(candidateExp, jobExpRequirement) {
  // Parse job experience requirement (e.g., "3+ năm", "2-3 năm")
  const expMatch = jobExpRequirement.match(/(\d+)/);
  if (!expMatch) return 80;

  const requiredExp = parseInt(expMatch[0]);

  if (candidateExp >= requiredExp) {
    return 100;
  } else if (candidateExp >= requiredExp - 1) {
    return 90;
  } else if (candidateExp >= requiredExp - 2) {
    return 70;
  } else {
    return Math.max(30, (candidateExp / requiredExp) * 100);
  }
}

/**
 * Tính matching dựa trên học vấn
 */
export function calculateEducationMatch(candidateEdu, jobEduRequirement) {
  if (!jobEduRequirement || jobEduRequirement.length === 0) return 80;

  const candidateLower = (candidateEdu || "").toLowerCase();
  const jobEduLower = (jobEduRequirement || "").toLowerCase();

  // Exact match
  if (candidateLower.includes("đại học") && jobEduLower.includes("đại học")) {
    return 100;
  }
  // Higher education than required
  if (
    (candidateLower.includes("thạc sĩ") ||
      candidateLower.includes("tiến sĩ")) &&
    (jobEduLower.includes("đại học") || jobEduLower.includes("cao đẳng"))
  ) {
    return 95;
  }
  // Same level
  if (candidateLower.includes("cao đẳng") && jobEduLower.includes("cao đẳng")) {
    return 85;
  }
  // Lower but close
  if (candidateLower.includes("trung cấp")) {
    return 60;
  }

  return 50;
}

/**
 * Tính matching dựa trên vị trí hiện tại
 */
export function calculatePositionMatch(candidateTitle, jobTitle) {
  const titleLower = (candidateTitle || "").toLowerCase();
  const jobLower = (jobTitle || "").toLowerCase();

  // Exact match
  if (titleLower === jobLower) return 100;

  // Similar level (Frontend, Backend, Fullstack)
  const titleKeywords = titleLower.split(/\s+/);
  const jobKeywords = jobLower.split(/\s+/);
  const matchedKeywords = titleKeywords.filter((word) =>
    jobKeywords.includes(word),
  );

  if (matchedKeywords.length > 0) {
    return 70 + matchedKeywords.length * 10;
  }

  // Related fields
  if (
    (titleLower.includes("developer") || titleLower.includes("lập")) &&
    (jobLower.includes("developer") || jobLower.includes("lập"))
  ) {
    return 60;
  }

  return 40;
}

/**
 * Tính recommendation score và text
 */
export function getRecommendation(score) {
  if (score >= 85) {
    return {
      label: "Rất phù hợp",
      emoji: "🌟",
      recommendation: "Rất phù hợp để mời phỏng vấn ngay.",
      priority: "high",
    };
  }
  if (score >= 70) {
    return {
      label: "Phù hợp",
      emoji: "✅",
      recommendation: "Phù hợp tốt, nên kiểm tra thêm chi tiết kinh nghiệm.",
      priority: "medium",
    };
  }
  if (score >= 50) {
    return {
      label: "Khá phù hợp",
      emoji: "⚠️",
      recommendation: "Có tiềm năng, phù hợp với vòng đánh giá kỹ thuật.",
      priority: "low",
    };
  }
  return {
    label: "Ít phù hợp",
    emoji: "❌",
    recommendation: "Kinh nghiệm hoặc kỹ năng chưa đáp ứng yêu cầu công việc.",
    priority: "reject",
  };
}

/**
 * Lấy danh sách missing skills
 */
export function getMissingSkills(candidateSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return [];

  return jobSkills.filter(
    (skill) =>
      !candidateSkills.some(
        (cs) =>
          cs.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(cs.toLowerCase()),
      ),
  );
}

/**
 * Lấy danh sách matching skills
 */
export function getMatchingSkills(candidateSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return [];

  return jobSkills.filter((skill) =>
    candidateSkills.some(
      (cs) =>
        cs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(cs.toLowerCase()),
    ),
  );
}

export function getMatchLabel(score) {
  if (score >= 85) return "Rất phù hợp";
  if (score >= 70) return "Phù hợp";
  if (score >= 50) return "Khá phù hợp";
  return "Ít phù hợp";
}
