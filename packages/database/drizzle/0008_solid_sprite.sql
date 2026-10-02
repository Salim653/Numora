ALTER TABLE "pvp_invites" ADD COLUMN "request_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "pvp_answers_player_request_uq" ON "pvp_answers" USING btree ("player_id","request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pvp_invites_sender_request_uq" ON "pvp_invites" USING btree ("sender_student_id","request_id");